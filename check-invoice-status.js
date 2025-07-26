// Check Invoice Status
// Use this to check if an invoice has been paid

const SERVER_URL = "http://localhost:3000";

async function checkInvoiceStatus(invoiceId) {
  console.log("📊 **INVOICE STATUS CHECK**");
  console.log("=" * 50);
  console.log(`🆔 Invoice ID: ${invoiceId}`);
  console.log("─".repeat(50));

  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Check invoice ${invoiceId}` }),
    });

    const data = await response.json();
    console.log("✅ Invoice Status Response:");
    console.log(data.response);

    if (data.response.includes("PAID") || data.response.includes("COMPLETED")) {
      console.log("\n🎉 **INVOICE PAID!**");
      console.log("💰 Payment has been received!");
    } else if (data.response.includes("SENT")) {
      console.log("\n📧 **INVOICE SENT**");
      console.log("⏳ Waiting for customer payment...");
    } else if (data.response.includes("DRAFT")) {
      console.log("\n📝 **INVOICE DRAFT**");
      console.log("📤 Invoice needs to be sent to customer");
    } else {
      console.log("\n❓ **STATUS UNCLEAR**");
      console.log("Check the response above for details");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Get invoice ID from command line argument
const invoiceId = process.argv[2];
if (!invoiceId) {
  console.log("❌ Please provide an invoice ID:");
  console.log("Usage: node check-invoice-status.js INV2-XXXX-XXXX-XXXX-XXXX");
  process.exit(1);
}

checkInvoiceStatus(invoiceId);
