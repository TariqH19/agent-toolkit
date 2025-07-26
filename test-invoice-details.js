// Test Invoice Details Response
// Check what information we actually get from invoice details

const SERVER_URL = "http://localhost:3000";

async function testInvoiceDetails(invoiceId) {
  console.log("🔍 **TESTING INVOICE DETAILS RESPONSE**");
  console.log("=" * 60);
  console.log(`🆔 Invoice ID: ${invoiceId}`);
  console.log("─".repeat(60));

  try {
    // Test different ways to get invoice details
    const commands = [
      `Get details for invoice ${invoiceId}`,
      `Get invoice ${invoiceId}`,
      `Show invoice ${invoiceId}`,
      `Check invoice ${invoiceId}`,
      `Invoice status ${invoiceId}`,
    ];

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n🧪 Test ${i + 1}: "${command}"`);
      console.log("─".repeat(40));

      try {
        const response = await fetch(`${SERVER_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: command }),
        });

        const data = await response.json();
        console.log("Response:");
        console.log(data.response);

        // Check if it's creating a new invoice instead of getting details
        if (data.response.includes("Invoice Created")) {
          console.log(
            "⚠️ This created a NEW invoice instead of getting details!"
          );
        } else if (
          data.response.includes("PAID") ||
          data.response.includes("paid")
        ) {
          console.log("✅ Found payment status in response!");
        } else if (
          data.response.includes("SENT") ||
          data.response.includes("sent")
        ) {
          console.log("📧 Found sent status in response!");
        } else if (
          data.response.includes("DRAFT") ||
          data.response.includes("draft")
        ) {
          console.log("📝 Found draft status in response!");
        } else {
          console.log("❓ No clear status information found");
        }
      } catch (error) {
        console.error("❌ Error with command:", error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Use a real invoice ID from the previous test
const invoiceId = process.argv[2] || "INV2-RTZP-HZSP-ZG2X-YLHT";
testInvoiceDetails(invoiceId);
