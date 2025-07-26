// Get Invoice Payment Link
// Use this to get the payment link for an existing invoice

const SERVER_URL = "http://localhost:3000";

async function getInvoicePaymentLink(invoiceId) {
  console.log("🔗 **GET INVOICE PAYMENT LINK**");
  console.log("=" * 50);
  console.log(`🆔 Invoice ID: ${invoiceId}`);
  console.log("─".repeat(50));

  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Get payment link for invoice ${invoiceId}` }),
    });

    const data = await response.json();
    console.log("✅ Payment Link Response:");
    console.log(data.response);

    // Extract payment link
    const paymentLinkMatch = data.response.match(/(https:\/\/www\.sandbox\.paypal\.com\/invoice\/p\/#[A-Z0-9-]+)/);
    if (paymentLinkMatch) {
      const paymentLink = paymentLinkMatch[1];
      console.log("\n🔗 **PAYMENT LINK FOUND:**");
      console.log(paymentLink);
      console.log("\n📋 **Instructions:**");
      console.log("1. Share this link with your customer");
      console.log("2. Customer can pay without a PayPal account");
      console.log("3. Check payment status with:");
      console.log(`   node check-invoice-status.js ${invoiceId}`);
    } else {
      console.log("\n❌ **PAYMENT LINK NOT FOUND**");
      console.log("The invoice may need to be sent first or may be in draft status");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Get invoice ID from command line argument
const invoiceId = process.argv[2];
if (!invoiceId) {
  console.log("❌ Please provide an invoice ID:");
  console.log("Usage: node get-invoice-link.js INV2-XXXX-XXXX-XXXX-XXXX");
  process.exit(1);
}

getInvoicePaymentLink(invoiceId);
