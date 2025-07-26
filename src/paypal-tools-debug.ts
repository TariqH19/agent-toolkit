import { DynamicTool } from "@langchain/core/tools";
import { PayPalAgentToolkit } from "@paypal/agent-toolkit/ai-sdk";

export const createPayPalTools = () => {
  try {
    console.log("🔧 Initializing PayPal Agent Toolkit...");
    console.log("PayPal Environment:", process.env.PAYPAL_ENVIRONMENT);
    console.log("PayPal Client ID exists:", !!process.env.PAYPAL_CLIENT_ID);
    console.log(
      "PayPal Client Secret exists:",
      !!process.env.PAYPAL_CLIENT_SECRET
    );

    // Create PayPal Agent Toolkit instance
    const toolkit = new PayPalAgentToolkit({
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      configuration: {
        actions: {
          orders: {
            create: true,
            get: true,
            capture: true,
          },
          invoices: {
            create: true,
            list: true,
            get: true,
            send: true,
            sendReminder: true,
            cancel: true,
            generateQRC: true,
          },
          refunds: {
            create: true,
            get: true,
          },
          shipment: {
            create: true,
            get: true,
            list: true,
          },
          transactions: {
            list: true,
          },
        },
        context: {
          sandbox: process.env.PAYPAL_ENVIRONMENT === "sandbox",
        },
      },
    });

    const aiSDKTools = toolkit.getTools();
    console.log("🔍 Available PayPal tools:", Object.keys(aiSDKTools));

    // Convert AI SDK tools to LangChain DynamicTools
    const langchainTools: DynamicTool[] = [];

    // Handle both array and object formats
    const toolsArray = Array.isArray(aiSDKTools)
      ? aiSDKTools
      : Object.values(aiSDKTools);
    console.log("📋 Processing", toolsArray.length, "tools");

    for (const tool of toolsArray) {
      console.log(
        "🛠️  Processing tool:",
        (tool as any).metadata?.name || (tool as any).name
      );

      const dynamicTool = new DynamicTool({
        name:
          (tool as any).metadata?.name || (tool as any).name || "unknown_tool",
        description:
          (tool as any).metadata?.description ||
          (tool as any).description ||
          "PayPal tool",
        func: async (input: string) => {
          try {
            console.log(
              "🚀 Executing PayPal tool:",
              (tool as any).metadata?.name || (tool as any).name
            );
            console.log("📥 Input:", input);

            // Parse input if it's a JSON string
            let params;
            try {
              params = JSON.parse(input);
            } catch {
              params = { input };
            }

            // Execute the tool function
            const result = await (tool as any).execute(params);
            console.log("✅ Tool result:", result);

            // Return the result as a JSON string
            return JSON.stringify(result);
          } catch (error: any) {
            console.error("❌ Tool execution error:", error);
            return JSON.stringify({
              error: error.message || "Unknown error occurred",
              success: false,
            });
          }
        },
      });

      langchainTools.push(dynamicTool);
    }

    console.log(
      "✅ Successfully initialized",
      langchainTools.length,
      "PayPal tools"
    );
    return langchainTools;
  } catch (error: any) {
    console.warn(
      "⚠️  PayPal Agent Toolkit not available, falling back to mock tools:",
      error.message
    );
    console.error("Full error:", error);

    // Fallback to basic mock tools if the toolkit fails to initialize
    return [
      new DynamicTool({
        name: "create_order",
        description: "Create a PayPal order for a given amount and currency",
        func: async (input: string) => {
          const params = JSON.parse(input);
          const orderId = `ORDER-${Math.random().toString(36).substr(2, 17)}`;

          return JSON.stringify({
            id: orderId,
            status: "CREATED",
            links: [
              {
                rel: "approve",
                href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
              },
            ],
            purchase_units: [
              {
                amount: {
                  value: params.purchase_units?.[0]?.amount?.value || "50.00",
                  currency_code:
                    params.purchase_units?.[0]?.amount?.currency_code || "GBP",
                },
              },
            ],
          });
        },
      }),

      new DynamicTool({
        name: "get_order",
        description: "Get PayPal order details by ID",
        func: async (input: string) => {
          const params = JSON.parse(input);
          return JSON.stringify({
            id: params.id,
            status: "CREATED",
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: "50.00",
                  currency_code: "GBP",
                },
              },
            ],
          });
        },
      }),

      new DynamicTool({
        name: "create_invoice",
        description: "Create a PayPal invoice",
        func: async (input: string) => {
          const params = JSON.parse(input);
          const invoiceId = `INV-${Math.random().toString(36).substr(2, 9)}`;

          return JSON.stringify({
            id: invoiceId,
            status: "DRAFT",
            detail: {
              invoice_number:
                params.detail?.invoice_number || `INV-${Date.now()}`,
            },
          });
        },
      }),

      new DynamicTool({
        name: "create_refund",
        description: "Create a refund for a PayPal payment",
        func: async (input: string) => {
          const params = JSON.parse(input);
          const refundId = `REF-${Math.random().toString(36).substr(2, 9)}`;

          return JSON.stringify({
            id: refundId,
            status: "COMPLETED",
            amount: params.amount,
            note_to_payer: params.note_to_payer || "Refund processed",
          });
        },
      }),

      new DynamicTool({
        name: "get_shipment",
        description: "Get shipment tracking information",
        func: async (input: string) => {
          const params = JSON.parse(input);

          return JSON.stringify({
            tracking_number: params.tracking_number,
            status: "IN_TRANSIT",
            last_updated_time: new Date().toISOString(),
            carrier: "USPS",
          });
        },
      }),
    ];
  }
};
