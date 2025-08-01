// Complete Order Workflow Test
// 1. Create Order → 2. Get Approval URL → 3. Capture Order

const SERVER_URL = "http://localhost:3000";

class OrderWorkflowTest {
  constructor() {
    this.orderId = null;
    this.approvalUrl = null;
  }

  async sendMessage(message) {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return await response.json();
  }

  // Step 1: Create a new order
  async createOrder(amount = "25.00") {
    console.log("🎯 Step 1: Creating Order");
    console.log(`💰 Amount: $${amount}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(`Create an order for $${amount}`);
      console.log("✅ Order Creation Response:");
      console.log(result.response);

      // Extract order ID
      const orderIdMatch = result.response.match(/Order ID: ([A-Z0-9]+)/);
      if (orderIdMatch) {
        this.orderId = orderIdMatch[1];
        console.log(`\n🆔 Order ID: ${this.orderId}`);
        return true;
      } else {
        console.log("❌ Could not extract Order ID");
        return false;
      }
    } catch (error) {
      console.error("❌ Error creating order:", error.message);
      return false;
    }
  }

  // Step 2: Get approval URL from order details
  async getApprovalUrl() {
    if (!this.orderId) {
      console.log("❌ No order ID available. Create an order first.");
      return false;
    }

    console.log("\n🔍 Step 2: Getting Approval URL");
    console.log(`🆔 Order ID: ${this.orderId}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(
        `Get details for order ${this.orderId}`
      );
      console.log("✅ Order Details Retrieved");

      // Extract approval URL
      const approvalUrlMatch = result.response.match(
        /https:\/\/www\.sandbox\.paypal\.com\/checkoutnow\?token=([A-Z0-9]+)/
      );

      if (approvalUrlMatch) {
        this.approvalUrl = approvalUrlMatch[0];
        console.log("\n🔗 **APPROVAL URL:**");
        console.log(this.approvalUrl);
        console.log("\n📋 **Next Steps:**");
        console.log("1. 🌐 Open the approval URL in your browser");
        console.log("2. 🔐 Log in with PayPal sandbox buyer account");
        console.log("3. ✅ Complete the payment approval");
        console.log("4. 🔄 Run this command to capture:");
        console.log(`   node capture-order.js ${this.orderId}`);
        return true;
      } else {
        console.log("❌ Could not find approval URL");
        console.log(
          "Raw response preview:",
          result.response.substring(0, 200) + "..."
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error getting approval URL:", error.message);
      return false;
    }
  }

  // Step 3: Capture the approved order
  async captureOrder() {
    if (!this.orderId) {
      console.log("❌ No order ID available. Create an order first.");
      return false;
    }

    console.log("\n💳 Step 3: Capturing Order Payment");
    console.log(`🆔 Order ID: ${this.orderId}`);
    console.log("─".repeat(50));

    try {
      const result = await this.sendMessage(
        `Capture payment for order ${this.orderId}`
      );
      console.log("✅ Capture Response:");
      console.log(result.response);

      if (
        result.response.includes("successfully") ||
        result.response.includes("COMPLETED")
      ) {
        console.log("\n🎉 **ORDER CAPTURE SUCCESSFUL!**");
        return true;
      } else {
        console.log("\n⚠️ **CAPTURE FAILED** - Order may not be approved yet");
        return false;
      }
    } catch (error) {
      console.error("❌ Error capturing order:", error.message);
      return false;
    }
  }

  // Run complete workflow
  async runCompleteWorkflow() {
    console.log("🚀 **PAYPAL ORDER WORKFLOW TEST**");
    console.log("=" * 60);

    // Step 1: Create Order
    const orderCreated = await this.createOrder();
    if (!orderCreated) {
      console.log("❌ Workflow stopped - Order creation failed");
      return;
    }

    // Step 2: Get Approval URL
    const approvalUrlRetrieved = await this.getApprovalUrl();
    if (!approvalUrlRetrieved) {
      console.log("❌ Workflow stopped - Could not get approval URL");
      return;
    }

    // Wait for user to approve
    console.log("\n⏳ **WAITING FOR APPROVAL**");
    console.log("Press Enter after approving the payment in your browser...");

    // In a real scenario, you'd wait for user input here
    // For testing, we'll just proceed to capture (which will fail if not approved)
    console.log("\n⚠️ **AUTO-PROCEEDING TO CAPTURE TEST**");
    console.log("(In real usage, wait for approval before capturing)");

    // Step 3: Capture Order
    await this.captureOrder();

    console.log("\n📝 **WORKFLOW SUMMARY:**");
    console.log(`🆔 Order ID: ${this.orderId}`);
    console.log(`🔗 Approval URL: ${this.approvalUrl}`);
    console.log("\n🔄 **AFTER APPROVAL, RUN THIS COMMAND:**");
    console.log(`node capture-order.js ${this.orderId}`);
    console.log("\n✅ Test complete!");
  }
}

// Run the test
async function main() {
  const test = new OrderWorkflowTest();
  await test.runCompleteWorkflow();
}

// Export for manual testing
if (require.main === module) {
  main().catch(console.error);
}

module.exports = OrderWorkflowTest;
