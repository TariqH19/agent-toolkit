import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OllamaLLM } from "./ollama-llm";
import { createPayPalTools } from "./paypal-tools";

export class PayPalAgent {
  private llm: OllamaLLM;
  private tools: any[];
  private chain: RunnableSequence<any, string> | null = null;

  constructor() {
    this.llm = new OllamaLLM({
      modelName: process.env.OLLAMA_MODEL || "llama3.1:8b",
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    this.tools = createPayPalTools();
  }

  async initialize() {
    try {
      // Create a simple prompt template for PayPal operations
      const prompt = ChatPromptTemplate.fromTemplate(`
You are a PayPal commerce assistant. You help users with PayPal operations including:
- Creating payments
- Checking payment status  
- Creating invoices
- Tracking shipments
- Processing refunds

Based on the user's request, determine what PayPal operation they want and provide a helpful response.

User request: {input}

Instructions:
- If they want to create a payment, extract the amount and currency
- If they want to check payment status, note they need a payment ID
- If they want to create an invoice, extract recipient email and amount
- If they want to track a shipment, note they need a tracking number
- If they want a refund, extract the payment ID and amount

Provide a clear, helpful response about what you would do with their PayPal request.
`);

      this.chain = RunnableSequence.from([
        prompt,
        this.llm,
        new StringOutputParser(),
      ]);

      console.log("✅ PayPal Agent initialized successfully!");
    } catch (error) {
      console.log(
        "⚠️  PayPal Agent initialized in fallback mode (Ollama not available)"
      );
      this.chain = null; // Will use rule-based approach
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      // Try to use LLM first, fallback to rule-based approach
      let response: string;
      try {
        if (!this.chain) {
          throw new Error("Agent not initialized");
        }
        response = await this.chain.invoke({ input: message });
      } catch (llmError: any) {
        console.log("🔄 LLM unavailable, using rule-based approach");
        response = this.getRuleBasedResponse(message);
      }

      // Execute the appropriate tool based on the message content
      const toolResponse = await this.executePayPalOperation(message);

      return `${response}\n\n${toolResponse}`;
    } catch (error: any) {
      console.error("Agent error:", error);
      return `Sorry, I encountered an error: ${
        error.message || "Unknown error"
      }`;
    }
  }

  private getRuleBasedResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("create") && lowerMessage.includes("payment")) {
      return "I'll help you create a PayPal payment. Let me extract the amount and currency from your request.";
    }

    if (lowerMessage.includes("check") && lowerMessage.includes("status")) {
      return "I'll check the payment status for you. Let me look up the payment details.";
    }

    if (lowerMessage.includes("invoice")) {
      return "I'll create an invoice for you. Let me extract the recipient email and amount from your request.";
    }

    if (lowerMessage.includes("track")) {
      return "I'll track the shipment for you. Let me look up the tracking information.";
    }

    if (lowerMessage.includes("refund")) {
      return "I'll process the refund for you. Let me extract the payment ID and refund amount.";
    }

    return "I'm a PayPal assistant that can help you with payments, invoices, tracking, and refunds. What would you like to do?";
  }

  private async executePayPalOperation(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    try {
      // Create order (PayPal orders API)
      if (lowerMessage.includes("create") && lowerMessage.includes("payment")) {
        const amountMatch = message.match(/[£$€]?(\d+(?:\.\d{2})?)/);
        const currencyMatch = message.match(/\b(USD|EUR|GBP|CAD|AUD)\b/i);

        const amount = amountMatch ? parseFloat(amountMatch[1]) : 50;
        // PayPal Sandbox typically only supports USD for testing
        const currency = "USD";

        // Find the create_order tool
        const createOrderTool = this.tools.find(
          (tool) =>
            tool.name === "create_order" ||
            (tool.name.includes("create") && tool.name.includes("order"))
        );

        if (!createOrderTool) {
          return "❌ Create order tool not available";
        }

        const orderRequest = {
          currencyCode: currency,
          items: [
            {
              name: "Payment via PayPal Agent",
              description: "Payment via PayPal Agent",
              quantity: 1,
              itemCost: parseFloat(amount.toFixed(2)),
              itemTotal: parseFloat(amount.toFixed(2)),
            },
          ],
        };

        const result = await createOrderTool.func(JSON.stringify(orderRequest));
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return `❌ **Error Creating Order:** ${JSON.stringify(parsed.error)}`;
        }

        // The PayPal toolkit might return different response formats
        const orderId =
          parsed.id ||
          parsed.order_id ||
          parsed.href?.split("/").pop() ||
          "N/A";
        const status = parsed.status || "CREATED";
        const approvalUrl =
          parsed.links?.find((l: any) => l.rel === "approve")?.href ||
          parsed.approval_url ||
          (orderId !== "N/A"
            ? `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`
            : "N/A");

        return `✅ **Order Created Successfully!**
- Order ID: ${orderId}
- Amount: ${amount} ${currency}
- Status: ${status}
- Approval URL: ${approvalUrl}`;
      }

      // Check order status
      if (lowerMessage.includes("check") && lowerMessage.includes("status")) {
        const orderIdMatch = message.match(/[A-Z0-9]{17}/); // PayPal order IDs are typically 17 characters
        const orderId = orderIdMatch ? orderIdMatch[0] : "sample-order-id";

        const getOrderTool = this.tools.find(
          (tool) =>
            tool.name === "get_order" ||
            (tool.name.includes("get") && tool.name.includes("order"))
        );

        if (!getOrderTool) {
          return "❌ Get order tool not available";
        }

        const result = await getOrderTool.func(JSON.stringify({ id: orderId }));
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return `❌ **Error Checking Order:** ${parsed.error}`;
        }

        return `📊 **Order Status Check:**
- Order ID: ${parsed.id || orderId}
- Current Status: ${parsed.status || "UNKNOWN"}
- Intent: ${parsed.intent || "N/A"}
- Total Amount: ${parsed.purchase_units?.[0]?.amount?.value || "N/A"} ${
          parsed.purchase_units?.[0]?.amount?.currency_code || ""
        }`;
      }

      // Create invoice
      if (lowerMessage.includes("invoice")) {
        const emailMatch = message.match(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
        );
        const amountMatch = message.match(/[£$€]?(\d+(?:\.\d{2})?)/);
        const descMatch = message.match(/'([^']+)'|"([^"]+)"/);

        const recipient_email = emailMatch
          ? emailMatch[1]
          : "customer@example.com";
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
        const description = descMatch
          ? descMatch[1] || descMatch[2]
          : "Service Invoice";

        const createInvoiceTool = this.tools.find(
          (tool) =>
            tool.name === "create_invoice" ||
            (tool.name.includes("create") && tool.name.includes("invoice"))
        );

        if (!createInvoiceTool) {
          return "❌ Create invoice tool not available";
        }

        const invoiceRequest = {
          detail: {
            invoice_number: `INV-${Date.now()}`,
            currency_code: "USD",
            note: description,
          },
          invoicer: {
            name: {
              given_name: "PayPal",
              surname: "Agent",
            },
            email_address: "usth@business.com",
          },
          primary_recipients: [
            {
              billing_info: {
                name: {
                  given_name: "Customer",
                  surname: "Name",
                },
                email_address: recipient_email,
              },
            },
          ],
          items: [
            {
              name: description,
              description: description,
              quantity: "1",
              unit_amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          ],
          amount: {
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          },
        };

        const result = await createInvoiceTool.func(
          JSON.stringify(invoiceRequest)
        );
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return `❌ **Error Creating Invoice:** ${JSON.stringify(
            parsed.error
          )}`;
        }

        // Extract invoice ID from href if available (PayPal toolkit response format)
        const invoiceId =
          parsed.id || (parsed.href ? parsed.href.split("/").pop() : "N/A");

        return `📄 **Invoice Created Successfully!**
- Invoice ID: ${invoiceId}
- Amount: ${amount} USD
- Recipient: ${recipient_email}
- Status: ${parsed.status || "DRAFT"}
- Invoice Number: ${parsed.detail?.invoice_number || invoiceId}`;
      }

      // Track shipment
      if (lowerMessage.includes("track")) {
        const trackingMatch = message.match(/([A-Z0-9]{10,})/);
        const trackingNumber = trackingMatch
          ? trackingMatch[1]
          : "1Z999AA1234567890";

        const trackShipmentTool = this.tools.find(
          (tool) =>
            tool.name === "get_shipment" ||
            tool.name.includes("track") ||
            tool.name.includes("shipment")
        );

        if (!trackShipmentTool) {
          return "❌ Shipment tracking tool not available";
        }

        const result = await trackShipmentTool.func(
          JSON.stringify({ tracking_number: trackingNumber })
        );
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return `❌ **Error Tracking Shipment:** ${parsed.error}`;
        }

        return `📦 **Shipment Tracking:**
- Tracking Number: ${trackingNumber}
- Status: ${parsed.status || "IN_TRANSIT"}
- Last Update: ${parsed.last_updated_time || "N/A"}
- Carrier: ${parsed.carrier || "Unknown"}`;
      }

      // Process refund
      if (lowerMessage.includes("refund")) {
        const orderIdMatch = message.match(/[A-Z0-9]{17}/);
        const amountMatch = message.match(/[£$€]?(\d+(?:\.\d{2})?)/);

        const orderId = orderIdMatch ? orderIdMatch[0] : "sample-order-id";
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 25;

        const createRefundTool = this.tools.find(
          (tool) =>
            tool.name === "create_refund" || tool.name.includes("refund")
        );

        if (!createRefundTool) {
          return "❌ Create refund tool not available";
        }

        const refundRequest = {
          amount: {
            value: amount.toFixed(2),
            currency_code: "GBP",
          },
          note_to_payer: "Customer requested refund",
        };

        const result = await createRefundTool.func(
          JSON.stringify(refundRequest)
        );
        const parsed = JSON.parse(result);

        if (parsed.error) {
          return `❌ **Error Processing Refund:** ${parsed.error}`;
        }

        return `💰 **Refund Processed:**
- Refund ID: ${parsed.id || "N/A"}
- Amount: ${amount} GBP
- Status: ${parsed.status || "COMPLETED"}
- Note: ${parsed.note_to_payer || "Customer requested refund"}`;
      }

      return "I can help you with PayPal operations like creating orders, checking status, creating invoices, tracking shipments, or processing refunds. Please specify what you'd like to do!";
    } catch (error: any) {
      return `Error executing PayPal operation: ${error.message}`;
    }
  }
}
