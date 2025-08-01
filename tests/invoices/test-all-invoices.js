const { runInvoiceTests } = require("./test-invoice-features");
const { runInvoiceWorkflows } = require("./test-invoice-workflows");
const { runInvoiceFunctionTests } = require("./test-invoice-functions");

const runAllInvoiceTests = async () => {
  console.log("🚀 **COMPLETE INVOICE TEST SUITE**");
  console.log("=".repeat(50));
  console.log("Running all invoice tests in sequence...\n");

  try {
    console.log("1️⃣ **INVOICE FEATURES TESTING**");
    await runInvoiceTests();

    console.log("\n" + "=".repeat(50));
    console.log("2️⃣ **INVOICE WORKFLOWS TESTING**");
    await runInvoiceWorkflows();

    console.log("\n" + "=".repeat(50));
    console.log("3️⃣ **INVOICE FUNCTIONS TESTING**");
    await runInvoiceFunctionTests();

    console.log("\n" + "=".repeat(50));
    console.log("✅ **ALL INVOICE TESTS COMPLETED**");
    console.log("Check the results above for detailed analysis.");
  } catch (error) {
    console.error("❌ Test suite error:", error.message);
  }
};

// Run if called directly
if (require.main === module) {
  runAllInvoiceTests().catch(console.error);
}

module.exports = { runAllInvoiceTests };
