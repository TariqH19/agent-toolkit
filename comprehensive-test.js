// Comprehensive PayPal Agent Test Suite
// Tests all PayPal operations including order creation, capture, invoices, etc.

const SERVER_URL = "http://localhost:3000";

// Store created resources for later operations
let createdResources = {
  orders: [],
  invoices: [],
  trackingNumbers: [],
};

// Helper function to make API calls
async function makeRequest(message, testName) {
  console.log(`\n🧪 ${testName}`);
  console.log(`📤 Message: "${message}"`);

  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Response: ${data.response}`);

    // Extract order ID if this was an order creation
    const orderIdMatch = data.response.match(/Order ID: ([A-Z0-9]+)/);
    if (orderIdMatch) {
      createdResources.orders.push(orderIdMatch[1]);
      console.log(`🔍 Captured Order ID: ${orderIdMatch[1]}`);
    }

    // Extract invoice ID if this was an invoice creation
    const invoiceIdMatch = data.response.match(/Invoice ID: (INV[A-Z0-9-]+)/);
    if (invoiceIdMatch) {
      createdResources.invoices.push(invoiceIdMatch[1]);
      console.log(`🔍 Captured Invoice ID: ${invoiceIdMatch[1]}`);
    }

    return data.response;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

// Helper function to wait between requests
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test Suite Functions
async function testOrderOperations() {
  console.log("\n🛒 ===== ORDER OPERATIONS TESTS =====");

  // Test 1: Create various orders
  await makeRequest("Create an order for $10.99", "Create Small Order");
  await wait(1000);

  await makeRequest("Create an order for $50 USD", "Create Medium Order");
  await wait(1000);

  await makeRequest("Create an order for $100", "Create Large Order");
  await wait(1000);

  // Test 2: Get order details (if we have any orders)
  if (createdResources.orders.length > 0) {
    const orderId = createdResources.orders[0];
    await makeRequest(`Get details for order ${orderId}`, "Get Order Details");
    await wait(1000);

    // Test 3: Try to capture/pay for the order
    await makeRequest(`Pay for order ${orderId}`, "Pay/Capture Order");
    await wait(1000);
  }
}

async function testInvoiceOperations() {
  console.log("\n🧾 ===== INVOICE OPERATIONS TESTS =====");

  // Test 1: Create invoices
  await makeRequest(
    "Create an invoice for client@example.com for $75 with description 'Web Development'",
    "Create Invoice 1"
  );
  await wait(1000);

  await makeRequest(
    "Create an invoice for customer@test.com for $150 for consulting",
    "Create Invoice 2"
  );
  await wait(1000);

  // Test 2: List all invoices
  await makeRequest("List all my invoices", "List All Invoices");
  await wait(1000);

  // Test 3: Get specific invoice details
  if (createdResources.invoices.length > 0) {
    const invoiceId = createdResources.invoices[0];
    await makeRequest(
      `Get details for invoice ${invoiceId}`,
      "Get Invoice Details"
    );
    await wait(1000);

    // Test 4: Send invoice
    await makeRequest(`Send invoice ${invoiceId}`, "Send Invoice");
    await wait(1000);
  }
}

async function testTransactionOperations() {
  console.log("\n💰 ===== TRANSACTION OPERATIONS TESTS =====");

  // Test 1: List transactions
  await makeRequest("List my recent transactions", "List Recent Transactions");
  await wait(1000);

  // Test 2: Create refund (this will likely fail without a valid payment, but tests the endpoint)
  await makeRequest("Create a refund for $25", "Create Refund Test");
  await wait(1000);
}

async function testShipmentOperations() {
  console.log("\n📦 ===== SHIPMENT OPERATIONS TESTS =====");

  // Test 1: Create shipment tracking
  await makeRequest(
    "Create a shipment tracking for 1Z999AA1234567890",
    "Create Shipment Tracking"
  );
  await wait(1000);

  // Test 2: Get shipment tracking
  await makeRequest(
    "Get tracking info for 1Z999AA1234567890",
    "Get Shipment Tracking"
  );
  await wait(1000);
}

async function testToolAvailability() {
  console.log("\n🔧 ===== TOOL AVAILABILITY TESTS =====");

  // Test tools endpoint
  try {
    console.log("\n🔍 Checking available tools...");
    const response = await fetch(`${SERVER_URL}/tools`);
    const toolsData = await response.json();
    console.log("🛠️ Available Tools:", toolsData);
  } catch (error) {
    console.error("❌ Error fetching tools:", error.message);
  }

  await wait(500);

  // Test what tools are available via chat
  await makeRequest("What PayPal tools are available?", "List Available Tools");
  await wait(1000);
}

async function testServerHealth() {
  console.log("\n❤️ ===== SERVER HEALTH CHECK =====");

  try {
    console.log("🔍 Checking server health...");
    const response = await fetch(`${SERVER_URL}/health`);
    const healthData = await response.json();
    console.log("✅ Server Health:", healthData);
  } catch (error) {
    console.error("❌ Server health check failed:", error.message);
    return false;
  }
  return true;
}

// Main test execution
async function runComprehensiveTests() {
  console.log("🚀 Starting PayPal Agent Comprehensive Test Suite");
  console.log("=".repeat(60));

  // Check server health first
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log(
      "❌ Server is not healthy. Please start the server with: npm run dev"
    );
    return;
  }

  try {
    // Run all test suites
    await testToolAvailability();
    await testOrderOperations();
    await testInvoiceOperations();
    await testTransactionOperations();
    await testShipmentOperations();

    // Summary
    console.log("\n📊 ===== TEST SUMMARY =====");
    console.log(`✅ Orders created: ${createdResources.orders.length}`);
    if (createdResources.orders.length > 0) {
      console.log(`🔍 Order IDs: ${createdResources.orders.join(", ")}`);
    }

    console.log(`✅ Invoices created: ${createdResources.invoices.length}`);
    if (createdResources.invoices.length > 0) {
      console.log(`🔍 Invoice IDs: ${createdResources.invoices.join(", ")}`);
    }

    console.log("\n💡 Next Steps:");
    console.log(
      "1. Orders created can be found in your PayPal Sandbox dashboard"
    );
    console.log(
      "2. Use order IDs to test payment capture: 'Pay for order ORDER_ID'"
    );
    console.log("3. Invoices can be managed through PayPal's invoice system");
    console.log("4. Check server logs for detailed API responses");

    console.log("\n🎉 Comprehensive test suite completed!");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Specific test for order capture workflow
async function testOrderCaptureWorkflow() {
  console.log("\n🎯 ===== ORDER CAPTURE WORKFLOW TEST =====");

  // Step 1: Create an order
  console.log("Step 1: Creating a new order...");
  await makeRequest(
    "Create an order for $25.50",
    "Create Order for Capture Test"
  );
  await wait(2000);

  if (createdResources.orders.length > 0) {
    const latestOrderId =
      createdResources.orders[createdResources.orders.length - 1];

    // Step 2: Get order details
    console.log(`Step 2: Getting details for order ${latestOrderId}...`);
    await makeRequest(
      `Get order details for ${latestOrderId}`,
      "Get Order Details"
    );
    await wait(2000);

    // Step 3: Attempt to capture the order
    console.log(`Step 3: Attempting to capture order ${latestOrderId}...`);
    await makeRequest(
      `Capture payment for order ${latestOrderId}`,
      "Capture Order Payment"
    );
    await wait(2000);

    console.log(`\n✅ Order workflow completed for Order ID: ${latestOrderId}`);
    console.log(
      "💡 Note: In sandbox, you can use PayPal's test accounts to complete the payment flow"
    );
  } else {
    console.log("❌ No orders were created to test capture workflow");
  }
}

// Export functions for individual testing
module.exports = {
  runComprehensiveTests,
  testOrderOperations,
  testInvoiceOperations,
  testTransactionOperations,
  testShipmentOperations,
  testOrderCaptureWorkflow,
  createdResources,
};

// Run comprehensive tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests();
}
