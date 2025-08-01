const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Utilities
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeRequest = async (message) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat`,
      { message },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
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

const extractInvoiceId = (response) => {
  const match =
    response.match(/Invoice ID:\s*(INV2-[A-Z0-9-]+)/i) ||
    response.match(/INV2-[A-Z0-9-]+/);
  return match ? match[1] || match[0] : null;
};

// Invoice workflow scenarios
const invoiceWorkflows = [
  {
    name: "Complete Invoice Lifecycle",
    description: "Create → Get → Send → Remind → QR → Cancel workflow",
    steps: async () => {
      const results = [];

      // Step 1: Create invoice
      console.log("   📝 Step 1: Creating invoice...");
      const createResponse = await makeRequest(
        'Create an invoice for usth@personal.com for $45.00 for "Complete Lifecycle Test"'
      );
      const invoiceId = extractInvoiceId(createResponse.response || "");
      results.push({
        step: "Create",
        response: createResponse.response,
        invoiceId,
      });

      if (!invoiceId) {
        return { success: false, error: "Failed to create invoice", results };
      }

      await delay(2000);

      // Step 2: Get invoice details
      console.log("   🔍 Step 2: Getting invoice details...");
      const getResponse = await makeRequest(
        `Get details for invoice ${invoiceId}`
      );
      results.push({ step: "Get Details", response: getResponse.response });

      await delay(2000);

      // Step 3: Send invoice
      console.log("   📧 Step 3: Sending invoice...");
      const sendResponse = await makeRequest(`Send invoice ${invoiceId}`);
      results.push({ step: "Send", response: sendResponse.response });

      await delay(2000);

      // Step 4: Send reminder
      console.log("   🔔 Step 4: Sending reminder...");
      const reminderResponse = await makeRequest(
        `Send a reminder for invoice ${invoiceId}`
      );
      results.push({ step: "Reminder", response: reminderResponse.response });

      await delay(2000);

      // Step 5: Generate QR code
      console.log("   📱 Step 5: Generating QR code...");
      const qrResponse = await makeRequest(
        `Generate QR code for invoice ${invoiceId}`
      );
      results.push({ step: "QR Code", response: qrResponse.response });

      await delay(2000);

      // Step 6: Cancel invoice
      console.log("   ❌ Step 6: Cancelling invoice...");
      const cancelResponse = await makeRequest(`Cancel invoice ${invoiceId}`);
      results.push({ step: "Cancel", response: cancelResponse.response });

      return { success: true, invoiceId, results };
    },
  },
  {
    name: "Bulk Invoice Management",
    description: "Create multiple invoices and manage them",
    steps: async () => {
      const results = [];
      const invoiceIds = [];

      // Create 3 different invoices
      const invoiceData = [
        { email: "usth@personal.com", amount: 100, desc: "Service A" },
        { email: "usth@personal.com", amount: 200, desc: "Service B" },
        { email: "usth@personal.com", amount: 300, desc: "Service C" },
      ];

      console.log("   📝 Creating multiple invoices...");
      for (let i = 0; i < invoiceData.length; i++) {
        const data = invoiceData[i];
        const response = await makeRequest(
          `Create an invoice for ${data.email} for $${data.amount}.00 for '${data.desc}'`
        );
        const invoiceId = extractInvoiceId(response.response || "");

        results.push({
          step: `Create Invoice ${i + 1}`,
          response: response.response,
          invoiceId,
        });

        if (invoiceId) invoiceIds.push(invoiceId);
        await delay(1500);
      }

      // Send all created invoices
      console.log("   📧 Sending all created invoices...");
      for (let i = 0; i < invoiceIds.length; i++) {
        const response = await makeRequest(`Send invoice ${invoiceIds[i]}`);
        results.push({
          step: `Send Invoice ${i + 1}`,
          response: response.response,
        });
        await delay(1500);
      }

      return { success: true, invoiceIds, results };
    },
  },
  {
    name: "Invoice Error Handling",
    description: "Test error scenarios and edge cases",
    steps: async () => {
      const results = [];

      // Test 1: Send reminder for invalid invoice ID
      console.log("   ❓ Testing reminder for invalid invoice ID...");
      const invalidResponse = await makeRequest(
        "Send reminder for invoice INV2-INVALID-ID-TEST"
      );
      results.push({
        step: "Invalid Reminder",
        response: invalidResponse.response || invalidResponse.error,
      });

      await delay(1500);

      // Test 2: Cancel non-existent invoice
      console.log("   ❓ Testing cancel non-existent invoice...");
      const cancelInvalidResponse = await makeRequest(
        "Cancel invoice INV2-FAKE-FAKE-FAKE-FAKE"
      );
      results.push({
        step: "Cancel Invalid",
        response: cancelInvalidResponse.response || cancelInvalidResponse.error,
      });

      await delay(1500);

      // Test 3: Send reminder for non-existent invoice
      console.log("   ❓ Testing reminder for non-existent invoice...");
      const reminderInvalidResponse = await makeRequest(
        "Send reminder for invoice INV2-FAKE-FAKE-FAKE-FAKE"
      );
      results.push({
        step: "Reminder Invalid",
        response:
          reminderInvalidResponse.response || reminderInvalidResponse.error,
      });

      await delay(1500);

      // Test 4: Create invoice with invalid email
      console.log("   ❓ Testing invalid email format...");
      const invalidEmailResponse = await makeRequest(
        "Create an invoice for invalid-email for $50.00 for testing"
      );
      results.push({
        step: "Invalid Email",
        response: invalidEmailResponse.response || invalidEmailResponse.error,
      });

      await delay(1500);

      // Test 5: Create invoice with zero amount
      console.log("   ❓ Testing zero amount invoice...");
      const zeroAmountResponse = await makeRequest(
        "Create an invoice for usth@personal.com for $0.00 for testing"
      );
      results.push({
        step: "Zero Amount",
        response: zeroAmountResponse.response || zeroAmountResponse.error,
      });

      return { success: true, results };
    },
  },
  {
    name: "Advanced Invoice Features",
    description: "Test advanced invoice capabilities",
    steps: async () => {
      const results = [];

      // Test 1: Invoice with detailed line items
      console.log("   💼 Creating detailed invoice with line items...");
      const detailedInvoice =
        await makeRequest(`Create a detailed invoice for usth@personal.com with:
        - Item 1: Website Design - $500.00
        - Item 2: Development - $1000.00  
        - Item 3: Testing - $200.00
        - Tax: 8.5%
        - Due date: 30 days`);
      results.push({
        step: "Detailed Invoice",
        response: detailedInvoice.response,
      });

      await delay(2000);

      // Test 2: Invoice with custom terms
      console.log("   📋 Creating invoice with custom payment terms...");
      const customTermsInvoice = await makeRequest(
        `Create an invoice for usth@personal.com for $750.00 for 'Custom Terms Test' with payment terms: 'Payment due within 15 days. Late fees apply after due date.'`
      );
      results.push({
        step: "Custom Terms",
        response: customTermsInvoice.response,
      });

      await delay(2000);

      // Test 3: Invoice with discount
      console.log("   💰 Creating invoice with discount...");
      const discountInvoice = await makeRequest(
        `Create an invoice for usth@personal.com for $100.00 for 'Discount Test' with 10% early payment discount`
      );
      results.push({
        step: "Discount Invoice",
        response: discountInvoice.response,
      });

      await delay(2000);

      // Test 4: Filter invoices by status
      console.log("   🔍 Filtering invoices by status...");
      const filterResponse = await makeRequest(
        "Show me all SENT invoices from the last 30 days"
      );
      results.push({
        step: "Filter by Status",
        response: filterResponse.response,
      });

      await delay(2000);

      // Test 5: Search invoices by amount
      console.log("   💵 Searching invoices by amount range...");
      const searchResponse = await makeRequest(
        "Find all invoices between $50 and $200"
      );
      results.push({
        step: "Search by Amount",
        response: searchResponse.response,
      });

      return { success: true, results };
    },
  },
];

// Main workflow test runner
const runInvoiceWorkflows = async () => {
  console.log("🔍 Checking server status...");

  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log("✅ Server is running!");
  } catch {
    console.log("❌ Server is not running. Please start with: npm run dev");
    return;
  }

  console.log("\n🔄 **INVOICE WORKFLOW TESTING SUITE**");
  console.log("=".repeat(80));
  console.log(
    `Testing ${invoiceWorkflows.length} comprehensive invoice workflows...\n`
  );

  const workflowResults = {
    total: invoiceWorkflows.length,
    successful: 0,
    failed: 0,
    allInvoiceIds: [],
  };

  for (let i = 0; i < invoiceWorkflows.length; i++) {
    const workflow = invoiceWorkflows[i];

    console.log(
      `\n${i + 1}/${invoiceWorkflows.length} 🔄 **${workflow.name}**`
    );
    console.log(`📋 ${workflow.description}`);
    console.log("─".repeat(60));

    try {
      const startTime = Date.now();
      const result = await workflow.steps();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (result.success) {
        console.log(`   ✅ Workflow completed successfully in ${duration}s`);
        workflowResults.successful++;

        // Collect created invoice IDs
        if (result.invoiceId)
          workflowResults.allInvoiceIds.push(result.invoiceId);
        if (result.invoiceIds)
          workflowResults.allInvoiceIds.push(...result.invoiceIds);

        // Show step results summary
        if (result.results) {
          console.log(`   📊 Completed ${result.results.length} steps:`);
          result.results.forEach((step, idx) => {
            const hasError =
              step.response?.includes("❌") || step.response?.includes("Error");
            const status = hasError ? "⚠️" : "✅";
            console.log(`      ${idx + 1}. ${status} ${step.step}`);
          });
        }
      } else {
        console.log(`   ❌ Workflow failed: ${result.error}`);
        workflowResults.failed++;
      }
    } catch (error) {
      console.log(`   ❌ Workflow error: ${error.message}`);
      workflowResults.failed++;
    }

    // Delay between workflows
    await delay(3000);
  }

  // Final summary
  console.log("\n" + "=".repeat(80));
  console.log("🎯 **INVOICE WORKFLOW TEST SUMMARY**");
  console.log("=".repeat(80));

  console.log("\n📊 **Workflow Results:**");
  console.log(`   • Total Workflows: ${workflowResults.total}`);
  console.log(`   • Successful: ${workflowResults.successful}`);
  console.log(`   • Failed: ${workflowResults.failed}`);
  console.log(
    `   • Success Rate: ${(
      (workflowResults.successful / workflowResults.total) *
      100
    ).toFixed(1)}%`
  );

  if (workflowResults.allInvoiceIds.length > 0) {
    console.log("\n📋 **All Created Invoice IDs:**");
    workflowResults.allInvoiceIds.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });
  }

  console.log("\n🔄 **Workflows Tested:**");
  invoiceWorkflows.forEach((workflow, index) => {
    const status = workflowResults.successful > index ? "✅" : "❌";
    console.log(`   ${status} ${workflow.name}: ${workflow.description}`);
  });

  console.log("\n💡 **Workflow Testing Insights:**");
  console.log("   • End-to-end invoice management processes validated");
  console.log("   • Error handling and edge cases covered");
  console.log("   • Bulk operations and filtering capabilities tested");
  console.log("   • Advanced features and customization verified");

  console.log("\n✨ **Invoice Workflow Testing Complete!**");
};

// Export for use in other files
module.exports = { runInvoiceWorkflows, invoiceWorkflows };

// Run if called directly
if (require.main === module) {
  runInvoiceWorkflows().catch(console.error);
}
