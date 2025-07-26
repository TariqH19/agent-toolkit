// Complete Invoice Workflow Test
// 1. Create Invoice → 2. Get Payment Link → 3. Check Status

const SERVER_URL = "http://localhost:3000";

class InvoiceWorkflowTest {
  constructor() {
    this.invoiceId = null;
    this.paymentLink = null;
  }

  async sendMessage(message) {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return await response.json();
  }

  // Step 1: Create a new invoice
  async createInvoice(email = "usth@personal.com", amount = "50.00", description = "Web Development Services") {
    console.log("📧 Step 1: Creating Invoice");
    console.log(`💰 Amount: $${amount}`);
    console.log(`📨 Recipient: ${email}`);
    console.log(`📝 Description: ${description}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(
        `Create an invoice for ${email} for $${amount} for ${description}`
      );
      console.log("✅ Invoice Creation Response:");
      console.log(result.response);

      // Extract invoice ID
      const invoiceIdMatch = result.response.match(/Invoice ID: (INV[A-Z0-9-]+)/);
      if (invoiceIdMatch) {
        this.invoiceId = invoiceIdMatch[1];
        console.log(`\n🆔 Invoice ID: ${this.invoiceId}`);
      } else {
        console.log("❌ Could not extract Invoice ID");
        return false;
      }

      // Extract payment link if available
      const paymentLinkMatch = result.response.match(/(https:\/\/www\.sandbox\.paypal\.com\/invoice\/p\/#[A-Z0-9-]+)/);
      if (paymentLinkMatch) {
        this.paymentLink = paymentLinkMatch[1];
        console.log(`\n🔗 Payment Link: ${this.paymentLink}`);
        return true;
      } else {
        console.log("⚠️ Payment link not immediately available");
        return true; // Invoice created, but may need to be sent first
      }
    } catch (error) {
      console.error("❌ Error creating invoice:", error.message);
      return false;
    }
  }

  // Step 2: Get payment link (if not already available)
  async getPaymentLink() {
    if (!this.invoiceId) {
      console.log("❌ No invoice ID available. Create an invoice first.");
      return false;
    }

    if (this.paymentLink) {
      console.log("\n🔗 Step 2: Payment Link Already Available");
      console.log(`💳 Payment Link: ${this.paymentLink}`);
      return true;
    }

    console.log("\n🔍 Step 2: Getting Payment Link");
    console.log(`🆔 Invoice ID: ${this.invoiceId}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(`Get payment link for invoice ${this.invoiceId}`);
      console.log("✅ Payment Link Response:");
      console.log(result.response);

      // Extract payment link
      const paymentLinkMatch = result.response.match(/(https:\/\/www\.sandbox\.paypal\.com\/invoice\/p\/#[A-Z0-9-]+)/);
      if (paymentLinkMatch) {
        this.paymentLink = paymentLinkMatch[1];
        console.log(`\n🔗 Payment Link Found: ${this.paymentLink}`);
        return true;
      } else {
        console.log("❌ Could not extract payment link");
        return false;
      }
    } catch (error) {
      console.error("❌ Error getting payment link:", error.message);
      return false;
    }
  }

  // Step 3: Check invoice status
  async checkInvoiceStatus() {
    if (!this.invoiceId) {
      console.log("❌ No invoice ID available. Create an invoice first.");
      return false;
    }

    console.log("\n📊 Step 3: Checking Invoice Status");
    console.log(`🆔 Invoice ID: ${this.invoiceId}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(`Check invoice ${this.invoiceId}`);
      console.log("✅ Invoice Status Response:");
      console.log(result.response);

      if (result.response.includes("PAID") || result.response.includes("paid")) {
        console.log("\n🎉 **INVOICE PAID!**");
        return true;
      } else if (result.response.includes("SENT") || result.response.includes("sent")) {
        console.log("\n📧 **INVOICE SENT** - Waiting for payment");
        return true;
      } else if (result.response.includes("DRAFT") || result.response.includes("draft")) {
        console.log("\n📝 **INVOICE DRAFT** - Ready to be sent");
        return true;
      } else {
        console.log("\n❓ **UNKNOWN STATUS**");
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking invoice status:", error.message);
      return false;
    }
  }

  // Run complete workflow
  async runCompleteWorkflow() {
    console.log("📧 **PAYPAL INVOICE WORKFLOW TEST**");
    console.log("=" * 60);

    // Step 1: Create Invoice
    const invoiceCreated = await this.createInvoice();
    if (!invoiceCreated) {
      console.log("❌ Workflow stopped - Invoice creation failed");
      return;
    }

    // Step 2: Get Payment Link (if needed)
    if (!this.paymentLink) {
      const paymentLinkRetrieved = await this.getPaymentLink();
      if (!paymentLinkRetrieved) {
        console.log("⚠️ Could not get payment link, but invoice was created");
      }
    }

    // Step 3: Check Status
    await this.checkInvoiceStatus();

    // Final Summary
    console.log("\n📝 **WORKFLOW SUMMARY:**");
    console.log(`🆔 Invoice ID: ${this.invoiceId}`);
    if (this.paymentLink) {
      console.log(`🔗 Payment Link: ${this.paymentLink}`);
      console.log("\n💡 **CUSTOMER PAYMENT:**");
      console.log("Share the payment link with your customer:");
      console.log(this.paymentLink);
      console.log("\n🔄 **TO CHECK PAYMENT STATUS, RUN:**");
      console.log(`node check-invoice-status.js ${this.invoiceId}`);
    } else {
      console.log("⚠️ Payment link not available");
      console.log("\n🔄 **TO GET PAYMENT LINK, RUN:**");
      console.log(`node get-invoice-link.js ${this.invoiceId}`);
    }
    console.log("\n✅ Invoice workflow complete!");
  }
}

// Run the test
async function main() {
  const test = new InvoiceWorkflowTest();
  await test.runCompleteWorkflow();
}

// Export for manual testing
if (require.main === module) {
  main().catch(console.error);
}

module.exports = InvoiceWorkflowTest;
