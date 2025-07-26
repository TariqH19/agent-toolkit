// Extract approval URL from order details
const SERVER_URL = "http://localhost:3000";

async function getApprovalUrl() {
  console.log("🔗 Getting Order Approval URL\n");

  // Use the order ID from the test
  const orderId = "3V688878BH278124F";

  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Get details for order ${orderId}` }),
    });

    const data = await response.json();
    console.log("Order Details Response:", data.response);

    // Look for approval URL in the response
    const approvalUrlMatch = data.response.match(
      /https:\/\/www\.sandbox\.paypal\.com\/checkoutnow\?token=([A-Z0-9]+)/
    );

    if (approvalUrlMatch) {
      const approvalUrl = approvalUrlMatch[0];
      console.log("\n🎯 APPROVAL URL FOUND:");
      console.log(`${approvalUrl}`);
      console.log("\n💡 To complete the order:");
      console.log("1. Open this URL in a browser");
      console.log("2. Log in with a PayPal sandbox buyer account");
      console.log("3. Complete the payment");
      console.log("4. Then run capture command");
      console.log("\n📧 PayPal Sandbox Test Accounts:");
      console.log("- Check your PayPal Developer Dashboard");
      console.log("- Use the pre-created buyer test accounts");
    } else {
      console.log("❌ Could not find approval URL in response");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

getApprovalUrl();
