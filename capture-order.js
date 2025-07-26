// Manual Order Capture Test
// Use this after you've approved an order in the browser

const SERVER_URL = "http://localhost:3000";

async function captureApprovedOrder(orderId) {
  console.log("💳 **MANUAL ORDER CAPTURE TEST**");
  console.log("=" * 50);
  console.log(`🆔 Order ID: ${orderId}`);
  console.log("─".repeat(50));

  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Capture payment for order ${orderId}` }),
    });

    const data = await response.json();
    console.log("✅ Capture Response:");
    console.log(data.response);

    if (
      data.response.includes("successfully") ||
      data.response.includes("COMPLETED")
    ) {
      console.log("\n🎉 **SUCCESS! Order captured successfully!**");
    } else if (
      data.response.includes("422") ||
      data.response.includes("not approved")
    ) {
      console.log("\n⚠️ **Order not approved yet**");
      console.log("Make sure to approve the order in PayPal before capturing.");
    } else {
      console.log("\n❌ **Capture failed for unknown reason**");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Get order ID from command line argument or use default
const orderId = process.argv[2] || "63B462424U848644S"; // Use the ID from previous test
captureApprovedOrder(orderId);
