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
    console.log(
      `🔧 Agent initialized with ${this.tools.length} PayPal tools:`,
      this.tools.map((t) => t.name)
    );
  }

  async initialize() {
    try {
      // Create a simple prompt template for PayPal operations
      const prompt = ChatPromptTemplate.fromTemplate(`
You are a PayPal commerce assistant. You help users with PayPal operations including:
- Creating orders/payments
- Checking payment status  
- Creating invoices
- Tracking shipments
- Processing refunds
- Listing transactions

Based on the user's request, determine what PayPal operation they want and provide a helpful response.

User request: {input}

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
      console.log(`🔍 Processing message: "${message}"`);

      // First try to execute the appropriate tool
      const toolResponse = await this.executePayPalOperation(message);

      // If tool was executed successfully, return tool response
      if (
        toolResponse &&
        !toolResponse.includes("I can help you with PayPal operations")
      ) {
        return toolResponse;
      }

      // If no tool was triggered, try LLM response or fallback
      let llmResponse: string;
      try {
        if (!this.chain) {
          throw new Error("LLM not available");
        }
        llmResponse = await this.chain.invoke({ input: message });
      } catch (llmError: any) {
        console.log("🔄 LLM unavailable, using rule-based approach");
        llmResponse = this.getRuleBasedResponse(message);
      }

      return `${llmResponse}\n\n${toolResponse}`;
    } catch (error: any) {
      console.error("Agent error:", error);
      return `Sorry, I encountered an error: ${
        error.message || "Unknown error"
      }`;
    }
  }

  private getRuleBasedResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (
      (lowerMessage.includes("create") || lowerMessage.includes("make")) &&
      (lowerMessage.includes("order") || lowerMessage.includes("payment"))
    ) {
      return "I'll help you create a PayPal order. Let me extract the amount and currency from your request.";
    }

    if (lowerMessage.includes("check") && lowerMessage.includes("status")) {
      return "I'll check the payment status for you. Let me look up the payment details.";
    }

    if (lowerMessage.includes("invoice")) {
      if (
        lowerMessage.includes("list") ||
        lowerMessage.includes("show") ||
        lowerMessage.includes("get")
      ) {
        return "I'll list your invoices for you.";
      }
      return "I'll create an invoice for you. Let me extract the recipient email and amount from your request.";
    }

    if (lowerMessage.includes("track") || lowerMessage.includes("shipment")) {
      return "I'll track the shipment for you. Let me look up the tracking information.";
    }

    if (lowerMessage.includes("refund")) {
      return "I'll process the refund for you. Let me extract the payment ID and refund amount.";
    }

    if (
      lowerMessage.includes("transaction") ||
      lowerMessage.includes("history")
    ) {
      return "I'll list your recent transactions.";
    }

    if (
      lowerMessage.includes("tool") ||
      lowerMessage.includes("available") ||
      lowerMessage.includes("can you do")
    ) {
      return `I have access to the following PayPal tools: ${this.tools
        .map((t) => t.name)
        .join(
          ", "
        )}. I can help you with orders, invoices, transactions, refunds, and shipment tracking.`;
    }

    return "I'm a PayPal assistant that can help you with payments, invoices, tracking, and refunds. What would you like to do?";
  }

  private async executePayPalOperation(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    try {
      // Create order
      if (
        (lowerMessage.includes("create") || lowerMessage.includes("make")) &&
        (lowerMessage.includes("order") || lowerMessage.includes("payment"))
      ) {
        return await this.createOrder(message);
      }

      // Get order details
      if (
        (lowerMessage.includes("get") ||
          lowerMessage.includes("details") ||
          lowerMessage.includes("check")) &&
        lowerMessage.includes("order")
      ) {
        return await this.getOrder(message);
      }

      // Capture/Pay order
      if (
        (lowerMessage.includes("capture") || lowerMessage.includes("pay")) &&
        lowerMessage.includes("order")
      ) {
        return await this.captureOrder(message);
      }

      // List transactions
      if (
        lowerMessage.includes("list") &&
        lowerMessage.includes("transaction")
      ) {
        return await this.listTransactions();
      }

      // Create invoice
      if (
        lowerMessage.includes("invoice") &&
        (lowerMessage.includes("create") || lowerMessage.includes("for"))
      ) {
        return await this.createInvoice(message);
      }

      // List invoices
      if (lowerMessage.includes("list") && lowerMessage.includes("invoice")) {
        return await this.listInvoices();
      }

      // Track shipment
      if (lowerMessage.includes("track") || lowerMessage.includes("shipment")) {
        return await this.trackShipment(message);
      }

      // Default fallback
      return "I can help you with PayPal operations like creating orders, checking status, creating invoices, tracking shipments, or processing refunds. Please specify what you'd like to do!";
    } catch (error: any) {
      return `Error executing PayPal operation: ${error.message}`;
    }
  }

  private async createOrder(message: string): Promise<string> {
    const amountMatch = message.match(/[£$€]?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 50;
    const currency = "USD"; // PayPal Sandbox typically uses USD

    const createOrderTool = this.tools.find(
      (tool) => tool.name === "create_order"
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
    console.log("🔍 Raw order creation result:", result);

    let parsed = JSON.parse(result);

    // Check if the result is double-stringified (common with some tools)
    if (typeof parsed === "string") {
      console.log("� Result is double-stringified, parsing again");
      parsed = JSON.parse(parsed);
    }

    console.log("🔍 Final parsed result:", JSON.stringify(parsed, null, 2));

    if (parsed.error) {
      return `❌ Error creating order: ${parsed.error}`;
    }

    // Extract order information from the result
    const orderId = this.extractOrderIdFromResponse(parsed);
    const status = parsed.status || "CREATED";
    const approvalUrl = this.extractApprovalUrl(parsed);

    return `💳 **Order Created Successfully!**
- Order ID: ${orderId}
- Amount: ${amount} ${currency}
- Status: ${status}
${approvalUrl ? `- Approval URL: ${approvalUrl}` : ""}`;
  }

  private async listTransactions(): Promise<string> {
    const listTransactionsTool = this.tools.find(
      (tool) => tool.name === "list_transactions"
    );
    if (!listTransactionsTool) {
      return "❌ List transactions tool not available";
    }

    const result = await listTransactionsTool.func("{}");
    const parsed = JSON.parse(result);

    if (parsed.error) {
      return `❌ Error listing transactions: ${parsed.error}`;
    }

    return `📊 **Recent Transactions:**
${JSON.stringify(parsed, null, 2)}`;
  }

  private async createInvoice(message: string): Promise<string> {
    const emailMatch = message.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    );
    const amountMatch = message.match(/[£$€]?(\d+(?:\.\d{2})?)/);
    const descriptionMatch = message.match(
      /'([^']*)'|"([^"]*)"|for\s+(.+?)(?:\s+for|\s*$)/i
    );

    const email = emailMatch ? emailMatch[1] : "customer@example.com";
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
    const description =
      (descriptionMatch &&
        (descriptionMatch[1] || descriptionMatch[2] || descriptionMatch[3])) ||
      "Service Invoice";

    const createInvoiceTool = this.tools.find(
      (tool) => tool.name === "create_invoice"
    );
    if (!createInvoiceTool) {
      return "❌ Create invoice tool not available";
    }

    const invoiceRequest = {
      detail: {
        invoice_number: `INV-${Date.now()}`,
        currency_code: "USD",
        note: description.trim(),
      },
      invoicer: {
        name: { given_name: "PayPal", surname: "Agent" },
        email_address: "merchant@example.com",
      },
      primary_recipients: [
        {
          billing_info: {
            name: { given_name: "Customer", surname: "Name" },
            email_address: email,
          },
        },
      ],
      items: [
        {
          name: description.trim(),
          description: description.trim(),
          quantity: "1",
          unit_amount: { currency_code: "USD", value: amount.toFixed(2) },
        },
      ],
      amount: {
        breakdown: {
          item_total: { currency_code: "USD", value: amount.toFixed(2) },
        },
      },
    };

    const result = await createInvoiceTool.func(JSON.stringify(invoiceRequest));
    console.log("🔍 Raw invoice creation result:", result);

    let parsed = JSON.parse(result);

    // Check if the result is double-stringified (common with some tools)
    if (typeof parsed === "string") {
      console.log("🔄 Invoice result is double-stringified, parsing again");
      parsed = JSON.parse(parsed);
    }

    console.log(
      "🔍 Final parsed invoice result:",
      JSON.stringify(parsed, null, 2)
    );

    if (parsed.error) {
      return `❌ Error creating invoice: ${parsed.error}`;
    }

    // Extract invoice ID from the response
    const invoiceId = this.extractInvoiceIdFromResponse(parsed);

    return `📄 **Invoice Created Successfully!**
- Invoice ID: ${invoiceId}
- Amount: ${amount} USD
- Recipient: ${email}
- Description: ${description}
- Status: DRAFT`;
  }

  private async listInvoices(): Promise<string> {
    const listInvoicesTool = this.tools.find(
      (tool) => tool.name === "list_invoices"
    );
    if (!listInvoicesTool) {
      return "❌ List invoices tool not available";
    }

    const result = await listInvoicesTool.func("{}");
    const parsed = JSON.parse(result);

    if (parsed.error) {
      return `❌ Error listing invoices: ${parsed.error}`;
    }

    return `📄 **Your Invoices:**
${JSON.stringify(parsed, null, 2)}`;
  }

  private async trackShipment(message: string): Promise<string> {
    const trackingMatch = message.match(/([A-Z0-9]{10,})/);
    const trackingNumber = trackingMatch
      ? trackingMatch[1]
      : "1Z999AA1234567890";

    const trackShipmentTool = this.tools.find(
      (tool) => tool.name === "create_shipment_tracking"
    );
    if (!trackShipmentTool) {
      return "❌ Shipment tracking tool not available";
    }

    const result = await trackShipmentTool.func(
      JSON.stringify({ tracking_number: trackingNumber })
    );
    const parsed = JSON.parse(result);

    if (parsed.error) {
      return `❌ Error tracking shipment: ${
        parsed.error.message || parsed.error
      }`;
    }

    return `📦 **Shipment Tracking:**
- Tracking Number: ${trackingNumber}
- Status: ${parsed.status || "IN_TRANSIT"}
- Last Update: ${parsed.last_updated_time || "N/A"}
- Carrier: ${parsed.carrier || "Unknown"}`;
  }

  // Helper methods to extract IDs from PayPal API responses
  private extractOrderIdFromHref(href: string): string | null {
    if (!href) return null;
    const match = href.match(/\/orders\/([A-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  private extractOrderIdFromResponse(response: any): string {
    console.log(
      "🔍 Extracting Order ID from response:",
      JSON.stringify(response, null, 2)
    );

    // First try to get from direct id field
    if (response.id) {
      console.log("✅ Found order ID:", response.id);
      return response.id;
    }

    // Try to extract from href
    if (response.href) {
      const extracted = this.extractOrderIdFromHref(response.href);
      if (extracted) {
        console.log("✅ Extracted order ID from href:", extracted);
        return extracted;
      }
    }

    // Try to extract from links array
    if (response.links && Array.isArray(response.links)) {
      for (const link of response.links) {
        if (link.rel === "self" && link.href) {
          const extracted = this.extractOrderIdFromHref(link.href);
          if (extracted) {
            console.log("✅ Extracted order ID from links:", extracted);
            return extracted;
          }
        }
      }
    }

    console.log("❌ Could not extract order ID");
    return "Unknown";
  }

  private extractInvoiceIdFromHref(href: string): string | null {
    if (!href) return null;
    const match = href.match(/\/invoices\/([A-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  private extractInvoiceIdFromResponse(response: any): string {
    console.log(
      "🔍 Extracting invoice ID from response:",
      JSON.stringify(response, null, 2)
    );

    // First try to get from direct id field
    if (response.id) {
      console.log("✅ Found invoice ID in response.id:", response.id);
      return response.id;
    }

    // Try to extract from href
    if (response.href) {
      console.log("🔗 Found href, trying to extract:", response.href);
      const extracted = this.extractInvoiceIdFromHref(response.href);
      if (extracted) return extracted;
    }

    console.log("❌ No invoice ID found, returning Unknown");
    return "Unknown";
  }

  private extractApprovalUrl(response: any): string | null {
    if (response.links) {
      const approvalLink = response.links.find(
        (link: any) => link.rel === "approve"
      );
      return approvalLink ? approvalLink.href : null;
    }
    return null;
  }

  private async getOrder(message: string): Promise<string> {
    // Extract order ID from message
    const orderIdMatch = message.match(/([A-Z0-9]{17})/);
    if (!orderIdMatch) {
      return "❌ Please provide a valid order ID (e.g., 'Get details for order 1AB23456CD789012E')";
    }

    const orderId = orderIdMatch[1];
    const getOrderTool = this.tools.find((tool) => tool.name === "get_order");
    if (!getOrderTool) {
      return "❌ Get order tool not available";
    }

    try {
      const result = await getOrderTool.func(JSON.stringify({ id: orderId }));
      let parsed = JSON.parse(result);

      // Check if the result is double-stringified
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      if (parsed.error) {
        return `❌ Error getting order: ${parsed.error}`;
      }

      const status = parsed.status || "UNKNOWN";
      const amount = parsed.purchase_units?.[0]?.amount?.value || "N/A";
      const currency =
        parsed.purchase_units?.[0]?.amount?.currency_code || "USD";
      const createTime = parsed.create_time || "N/A";

      return `📄 **Order Details**
- Order ID: ${orderId}
- Status: ${status}
- Amount: ${amount} ${currency}
- Created: ${createTime}
- Details: ${JSON.stringify(parsed, null, 2)}`;
    } catch (error: any) {
      return `❌ Error retrieving order: ${error.message}`;
    }
  }

  private async captureOrder(message: string): Promise<string> {
    // Extract order ID from message
    const orderIdMatch = message.match(/([A-Z0-9]{17})/);
    if (!orderIdMatch) {
      return "❌ Please provide a valid order ID (e.g., 'Capture payment for order 1AB23456CD789012E')";
    }

    const orderId = orderIdMatch[1];
    const payOrderTool = this.tools.find((tool) => tool.name === "pay_order");
    if (!payOrderTool) {
      return "❌ Pay order tool not available";
    }

    try {
      const result = await payOrderTool.func(JSON.stringify({ id: orderId }));
      let parsed = JSON.parse(result);

      // Check if the result is double-stringified
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      if (parsed.error) {
        return `❌ Error capturing order: ${parsed.error}`;
      }

      const status = parsed.status || "UNKNOWN";
      const captureId =
        parsed.purchase_units?.[0]?.payments?.captures?.[0]?.id || "N/A";

      return `💰 **Order Capture Successful**
- Order ID: ${orderId}
- Status: ${status}
- Capture ID: ${captureId}
- Details: ${JSON.stringify(parsed, null, 2)}`;
    } catch (error: any) {
      return `❌ Error capturing order: ${error.message}`;
    }
  }
}
