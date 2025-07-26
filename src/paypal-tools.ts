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
            get: true,
            list: true,
            send: true,
            sendReminder: true,
            cancel: true,
            generateQRC: true,
          },
          refunds: {
            create: true,
            get: true,
          },
          payments: {
            createRefund: true,
            getRefunds: true,
          },
          shipment: {
            create: true,
            get: true,
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

    // Iterate through the tools object
    for (const [toolKey, tool] of Object.entries(aiSDKTools)) {
      console.log(`🛠️ Initializing tool: ${toolKey}`);

      const dynamicTool = new DynamicTool({
        name: toolKey,
        description: (tool as any)?.description || `PayPal ${toolKey} tool`,
        func: async (input: string) => {
          try {
            console.log(`🚀 Executing PayPal tool: ${toolKey}`);
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
    console.error("❌ Error initializing PayPal tools:", error);
    throw error;
  }
};
