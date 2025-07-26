// Test order capture after payment approval
const SERVER_URL = "http://localhost:3000";

async function testApprovedOrderCapture() {
  console.log("🎯 Testing Order Capture After Payment Approval\n");

  // The order ID from the previous test that was just approved
  const approvedOrderId = "3V688878BH278124F";

  console.log(`📋 Order ID: ${approvedOrderId}`);
  console.log("✅ Payment has been approved by buyer");
  console.log("\nStep 1: Checking current order status...");

  try {
    // First, check the current status
    const statusResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Get details for order ${approvedOrderId}`,
      }),
    });

    const statusData = await statusResponse.json();
    console.log("📄 Current Order Status:");
    console.log(statusData.response.substring(0, 300) + "...\n");

    // Now attempt to capture the approved order
    console.log("Step 2: Attempting to capture the approved order...");
    const captureResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Capture payment for order ${approvedOrderId}`,
      }),
    });

    const captureData = await captureResponse.json();
    console.log("💰 Capture Response:");
    console.log(captureData.response);

    // Check if capture was successful
    if (
      captureData.response.includes("Capture Successful") ||
      captureData.response.includes("COMPLETED")
    ) {
      console.log("\n🎉 SUCCESS! Order capture completed!");
      console.log("✅ Payment has been successfully processed");
      console.log("💳 Funds should now be available in your PayPal account");
    } else if (captureData.response.includes("Error")) {
      console.log("\n⚠️ Capture attempt result:");
      console.log("This might be expected if the order status changed");
      console.log("Check the PayPal dashboard for current order status");
    } else {
      console.log("\n🔍 Unexpected response - check the details above");
    }

    // Final status check
    console.log("\nStep 3: Final order status check...");
    const finalStatusResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Get details for order ${approvedOrderId}`,
      }),
    });

    const finalStatusData = await finalStatusResponse.json();
    console.log("📋 Final Order Status:");
    console.log(finalStatusData.response.substring(0, 400) + "...");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔗 PayPal Sandbox Dashboard:");
  console.log("https://developer.paypal.com/developer/accounts/");
  console.log("Check your dashboard to see the completed transaction!");
}

testApprovedOrderCapture();
