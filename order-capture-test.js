// Simple Order Capture Test
// Test the order capture functionality with a real order ID

const SERVER_URL = "http://localhost:3000";

async function testOrderCapture() {
  console.log("🎯 Testing Order Capture Functionality\n");

  // Step 1: Create a new order
  console.log("Step 1: Creating a new order...");
  try {
    const createResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Create an order for $15.75" }),
    });

    const createData = await createResponse.json();
    console.log("✅ Create Response:", createData.response);

    // Extract order ID
    const orderIdMatch = createData.response.match(/Order ID: ([A-Z0-9]+)/);
    if (!orderIdMatch) {
      console.log("❌ Could not extract order ID");
      return;
    }

    const orderId = orderIdMatch[1];
    console.log(`🔍 Extracted Order ID: ${orderId}\n`);

    // Step 2: Get order details
    console.log("Step 2: Getting order details...");
    const detailsResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Get details for order ${orderId}` }),
    });

    const detailsData = await detailsResponse.json();
    console.log(
      "✅ Details Response:",
      detailsData.response.substring(0, 500) + "...\n"
    );

    // Step 3: Try to capture the order
    console.log("Step 3: Attempting to capture the order...");
    const captureResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Capture payment for order ${orderId}` }),
    });

    const captureData = await captureResponse.json();
    console.log("✅ Capture Response:", captureData.response);

    console.log("\n💡 Important Notes:");
    console.log("- PayPal Sandbox orders need buyer approval before capture");
    console.log(
      "- Use the approval URL from the order details to simulate buyer payment"
    );
    console.log(
      "- In production, the buyer would complete payment through PayPal"
    );
    console.log(
      `- Your Order ID: ${orderId} can be found in PayPal Sandbox dashboard`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Test using an existing order ID from the comprehensive test
async function testWithExistingOrder() {
  console.log("🔄 Testing with existing order ID...\n");

  // Use one of the order IDs from the comprehensive test
  const existingOrderId = "5UT999209L5108512"; // From the test output

  console.log(`Using existing Order ID: ${existingOrderId}`);

  try {
    // Try to capture this order
    const captureResponse = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Capture payment for order ${existingOrderId}`,
      }),
    });

    const captureData = await captureResponse.json();
    console.log("✅ Capture Response:", captureData.response);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function main() {
  await testOrderCapture();
  console.log("\n" + "=".repeat(60) + "\n");
  await testWithExistingOrder();
}

main();
