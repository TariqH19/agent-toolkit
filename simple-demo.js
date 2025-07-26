// Simple PayPal Agent Demo
// Quick demonstration of key PayPal operations

const SERVER_URL = "http://localhost:3000";

async function demo() {
  console.log("🚀 PayPal Agent Demo - Real API Integration\n");

  // Helper function
  async function ask(question) {
    console.log(`🤖 ${question}`);
    try {
      const response = await fetch(`${SERVER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = await response.json();
      console.log(`✅ ${data.response}\n`);
      return data.response;
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
      return null;
    }
  }

  // Demo sequence
  console.log("=".repeat(60));

  // 1. Create an order
  const orderResponse = await ask("Create an order for $29.99");

  // 2. Create an invoice
  await ask(
    "Create an invoice for demo@customer.com for $125 with description 'Demo Service'"
  );

  // 3. List invoices
  await ask("List my recent invoices");

  // 4. Check available tools
  await ask("What PayPal tools are available?");

  // 5. If we got an order, try to get its details
  if (orderResponse) {
    const orderIdMatch = orderResponse.match(/Order ID: ([A-Z0-9]+)/);
    if (orderIdMatch) {
      const orderId = orderIdMatch[1];
      await ask(`Get details for order ${orderId}`);
    }
  }

  console.log("=".repeat(60));
  console.log("🎉 Demo completed!");
  console.log("\n💡 Key Features Demonstrated:");
  console.log("✅ Real PayPal order creation with genuine order IDs");
  console.log("✅ Invoice creation and management");
  console.log("✅ Order details retrieval");
  console.log("✅ Tool availability listing");
  console.log("\n🔗 Your PayPal Sandbox Dashboard:");
  console.log("https://developer.paypal.com/developer/accounts/");
  console.log("(Log in to see your test orders and invoices)");
}

demo();
