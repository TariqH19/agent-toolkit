const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test configuration
const testConfig = {
  timeout: 10000,
  delayBetweenTests: 1000,
};

// Test data
const testInvoiceData = {
  recipient: "usth@personal.com",
  amount: 75.5,
  description: "Invoice Feature Testing",
  customerName: "Test Customer",
};

// Utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeRequest = async (message) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat`,
      { message },
      {
        headers: { "Content-Type": "application/json" },
        timeout: testConfig.timeout,
      }
    );
    return response.data;
  } catch (error) {
    return {
      error: error.message,
      status: error.response?.status,
    };
  }
};

const checkServerStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

const extractInvoiceId = (response) => {
  const match =
    response.match(/Invoice ID:\s*(INV2-[A-Z0-9-]+)/i) ||
    response.match(/INV2-[A-Z0-9-]+/);
  return match ? match[1] || match[0] : null;
};

const analyzeResponse = (response) => {
  const hasError =
    response.includes("❌") ||
    response.includes("Error") ||
    response.includes("error");
  const hasSuccess =
    response.includes("✅") ||
    response.includes("SUCCESS") ||
    response.includes("Successfully");

  let status = "🎉 SUCCESS";
  if (hasError) status = "⚠️ ISSUE DETECTED";
  else if (!hasSuccess) status = "ℹ️ INFO";

  return {
    success: hasSuccess && !hasError,
    status,
    hasInvoiceId: extractInvoiceId(response) !== null,
    invoiceId: extractInvoiceId(response),
  };
};

const printTestHeader = (testNum, total, description) => {
  console.log(`\n${testNum}/${total} 🧪 Testing: "${description}"`);
  console.log("─".repeat(70));
};

const printTestResult = (response, analysis) => {
  console.log("✅ Response:");
  console.log(
    response.substring(0, 300) + (response.length > 300 ? "..." : "")
  );
  console.log(
    `${analysis.status} - ${
      analysis.success
        ? "Operation completed successfully"
        : "Check response for details"
    }`
  );
};

// Invoice test cases
const invoiceTests = [
  {
    description: "Create detailed invoice with line items",
    message: `Create an invoice for ${testInvoiceData.recipient} with the following details:
- Amount: $${testInvoiceData.amount}
- Description: ${testInvoiceData.description}
- Customer: ${testInvoiceData.customerName}
- Due date: 30 days from now
- Include payment terms`,
  },
  {
    description: "Create simple invoice with minimal details",
    message:
      'Create a basic invoice for usth@personal.com for $25.00 for "Basic Service"',
  },
  {
    description: "Create invoice with custom invoice number",
    message:
      'Create an invoice for usth@personal.com for $150.00 for "Consulting Services" with custom invoice number CONS-2025-001',
  },
  {
    description: "Get invoice details by ID",
    message: "Get details for invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      // Create an invoice first to get a valid ID
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $10.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      return invoiceId ? `Get details for invoice ${invoiceId}` : null;
    },
  },
  {
    description: "Get invoice details with non-existent ID",
    message: "Get details for invoice INV2-FAKE-FAKE-FAKE-FAKE",
  },
  {
    description: "Send an existing invoice",
    message: "Send invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      // Create an invoice first
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $15.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      return invoiceId ? `Send invoice ${invoiceId}` : null;
    },
  },
  {
    description: "Send invoice reminder",
    message: "Send a reminder for invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      // Create and send an invoice first
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $20.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      if (invoiceId) {
        await delay(2000);
        await makeRequest(`Send invoice ${invoiceId}`);
        await delay(2000);
        return `Send a reminder for invoice ${invoiceId}`;
      }
      return null;
    },
  },
  {
    description: "Generate QR code for invoice payment",
    message: "Generate QR code for invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $30.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      return invoiceId ? `Generate QR code for invoice ${invoiceId}` : null;
    },
  },
  {
    description: "Cancel a sent invoice",
    message: "Cancel invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      // Create and send an invoice first
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $40.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      if (invoiceId) {
        await delay(2000);
        await makeRequest(`Send invoice ${invoiceId}`);
        await delay(2000);
        return `Cancel invoice ${invoiceId}`;
      }
      return null;
    },
  },
  {
    description: "Get invoice payment link",
    message: "Get payment link for invoice INV2-PTKG-E338-SKZW-2KB3",
    setup: async () => {
      const createResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $50.00 for testing"
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      return invoiceId ? `Get payment link for invoice ${invoiceId}` : null;
    },
  },
  {
    description: "Create invoice with tax and shipping",
    message: `Create an invoice for usth@personal.com for $100.00 for "Product Sale" with 8.5% tax and $10.00 shipping`,
  },
  {
    description: "Create recurring invoice template",
    message: `Create a monthly recurring invoice template for usth@personal.com for $29.99 for "Monthly Subscription"`,
  },
];

// Main test execution
const runInvoiceTests = async () => {
  console.log("🔍 Checking server status...");
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log("❌ Server is not running on http://localhost:3000");
    console.log("Please start the server with: npm run dev");
    return;
  }

  console.log("✅ Server is running!");
  console.log("🧾 **INVOICE FEATURES TEST SUITE**");
  console.log(`\nTesting ${invoiceTests.length} invoice operations...\n`);

  const results = {
    total: invoiceTests.length,
    successful: 0,
    failed: 0,
    info: 0,
    createdInvoices: [],
  };

  for (let i = 0; i < invoiceTests.length; i++) {
    const test = invoiceTests[i];
    printTestHeader(i + 1, invoiceTests.length, test.description);

    try {
      // Setup dynamic message if needed
      let messageToSend = test.message;
      if (test.setup) {
        const setupResult = await test.setup();
        messageToSend = setupResult || test.message;
      }

      const response = await makeRequest(messageToSend);
      const responseText =
        response.response || response.error || JSON.stringify(response);
      const analysis = analyzeResponse(responseText);

      printTestResult(responseText, analysis);

      // Track results
      if (analysis.success) {
        results.successful++;
        if (analysis.invoiceId) {
          results.createdInvoices.push(analysis.invoiceId);
        }
      } else if (analysis.status.includes("ISSUE")) {
        results.failed++;
      } else {
        results.info++;
      }

      await delay(testConfig.delayBetweenTests);
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`);
      results.failed++;
      await delay(testConfig.delayBetweenTests);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("🎯 **INVOICE FEATURES TEST SUMMARY**");
  console.log("=".repeat(60));

  console.log("\n📊 **Results:**");
  console.log(`   • Total Tests: ${results.total}`);
  console.log(`   • Successful: ${results.successful}`);
  console.log(`   • Failed: ${results.failed}`);
  console.log(`   • Info/Partial: ${results.info}`);
  console.log(
    `   • Success Rate: ${((results.successful / results.total) * 100).toFixed(
      1
    )}%`
  );

  if (results.createdInvoices.length > 0) {
    console.log("\n📋 **Created Invoice IDs:**");
    results.createdInvoices.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });
  }

  console.log("\n🧾 **Features Tested:**");
  console.log("   • Invoice Creation (Basic & Advanced)");
  console.log("   • Invoice Details Retrieval");
  console.log("   • Invoice Sending");
  console.log("   • Reminder Management");
  console.log("   • QR Code Generation");
  console.log("   • Invoice Cancellation");
  console.log("   • Payment Link Generation");
  console.log("   • Tax & Shipping Handling");
  console.log("   • Recurring Invoice Templates");

  console.log("\n💡 **Next Steps:**");
  console.log("   • Review failed tests for PayPal API issues");
  console.log("   • Test with different invoice amounts and recipients");
  console.log("   • Verify created invoices in PayPal sandbox dashboard");

  console.log("\n✨ **Invoice Testing Complete!**");
};

// Run the tests
if (require.main === module) {
  runInvoiceTests().catch(console.error);
}

module.exports = { runInvoiceTests, invoiceTests, testInvoiceData };
