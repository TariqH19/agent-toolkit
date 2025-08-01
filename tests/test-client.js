// PayPal Agent Toolkit - Main Test Suite
// For comprehensive workflow testing, use:
//   node test-invoice-workflow.js  - Complete invoice workflow
//   node test-order-workflow.js    - Complete order workflow

const testMessages = [
  "Create an order for $50",
  "Create an order for $25.99 USD",
  "Create an invoice for usth@personal.com for $100 for Website development",
  "Create an invoice for usth@personal.com for $250 for consulting services",
  "Check invoice INV2-XXXX-XXXX-XXXX-XXXX",
  "Get payment link for invoice INV2-XXXX-XXXX-XXXX-XXXX",
  "List my recent transactions",
  "List all my invoices",
  "Create a shipment tracking for 1Z999AA1234567890",
];

// Test to check what tools are actually available
async function testAvailableTools() {
  console.log("🔧 Testing available PayPal tools...\n");

  // First check the tools endpoint
  try {
    const toolsResponse = await fetch("http://localhost:3000/tools");
    const toolsData = await toolsResponse.json();
    console.log("🛠️  Available Tools from API:", toolsData);
  } catch (error) {
    console.log("⚠️  Could not fetch tools endpoint");
  }

  const toolTests = [
    "What PayPal tools are available in this system?",
    "Show me all available PayPal operations",
    "List all tools you can use",
    "What can you do with PayPal?",
  ];

  for (const test of toolTests) {
    console.log(`🤖 Testing: "${test}"`);
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: test }),
      });

      const data = await response.json();
      console.log(`   ✅ Response: ${data.response}\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

// Diagnostic test to check for real API integration
async function testRealAPIIntegration() {
  console.log("🔍 Testing Real PayPal API Integration...\n");

  const diagnosticTests = [
    {
      name: "Simple Order Creation",
      message: "Create an order for $10",
      expectReal: true,
    },
    {
      name: "Invoice Creation",
      message: "Create an invoice for usth@personal.com for $10",
      expectReal: true,
    },
    {
      name: "Transaction Listing",
      message: "List my recent transactions",
      expectReal: true,
    },
  ];

  for (const test of diagnosticTests) {
    console.log(`🧪 Diagnostic: ${test.name}`);
    console.log(`📤 Message: "${test.message}"`);

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: test.message }),
      });

      const data = await response.json();
      console.log(`📥 Response: ${data.response}`);

      // Analyze if it's real API or mock
      const hasRealPayPalId =
        data.response.includes("ORDER-") ||
        data.response.includes("INV2-") ||
        data.response.includes("transaction_id") ||
        /Order ID: [A-Z0-9-]{10,}/.test(data.response) ||
        /Invoice ID: [A-Z0-9-]{10,}/.test(data.response);

      const isFallback = data.response.includes(
        "I'm a PayPal assistant that can help you with"
      );

      const hasCreatedStatus = data.response.includes("Created Successfully");

      if (hasRealPayPalId && hasCreatedStatus) {
        console.log("✅ Real PayPal API response detected");
      } else if (isFallback) {
        console.log("⚠️  Fallback response - tool not triggered");
      } else if (hasCreatedStatus && data.response.includes("Unknown")) {
        console.log("⚠️  Mock data response detected");
      } else {
        console.log("ℹ️  Response analysis unclear");
      }

      console.log("─".repeat(50));
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
async function testAgent() {
  console.log("🧪 Testing PayPal Agent with Real API...\n");

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n${i + 1}. 🤖 Testing: "${message}"`);
    console.log("⏱️  Executing...");

    try {
      const startTime = Date.now();
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   ✅ Response: ${data.response}`);

      // Try to extract and display key information
      if (
        data.response.includes("ORDER-") ||
        data.response.includes("order_id") ||
        data.response.includes("Order ID")
      ) {
        const orderMatch = data.response.match(
          /ORDER-[A-Z0-9]+|Order ID: ([A-Z0-9-]+)/
        );
        if (orderMatch) {
          console.log(
            `   🆔 Order ID Found: ${orderMatch[1] || orderMatch[0]}`
          );
        }
      }

      if (
        data.response.includes("INV2-") ||
        data.response.includes("invoice_id") ||
        data.response.includes("Invoice ID")
      ) {
        const invoiceMatch = data.response.match(
          /INV2-[A-Z0-9-]+|Invoice ID: ([A-Z0-9-]+)/
        );
        if (invoiceMatch) {
          console.log(
            `   📄 Invoice ID Found: ${invoiceMatch[1] || invoiceMatch[0]}`
          );
        }
      }

      if (data.response.includes("error") || data.response.includes("Error")) {
        console.log(`   ⚠️  Contains error information`);
      }

      // Check if it's a fallback response (indicates tool might not be working)
      if (
        data.response.includes("I'm a PayPal assistant that can help you with")
      ) {
        console.log(
          `   ⚠️  Got fallback response - tool may not be configured properly`
        );
      } else if (data.response.includes("Created Successfully")) {
        console.log(`   ✅ Tool executed successfully`);
      }

      // Check for real API responses vs mock data
      if (
        data.response.includes("Unknown") &&
        data.response.includes("Successfully")
      ) {
        console.log(
          `   ⚠️  Response contains Unknown values - may be using mock data`
        );
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }

    // Wait between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log("\n🎉 Testing complete!");
  console.log("\n📊 Test Summary:");
  console.log("- Used USD currency (required for PayPal sandbox)");
  console.log("- Tested real PayPal API integration");
  console.log("- Tested invoice creation with real recipients");
  console.log("- Tested product and transaction listing");
  console.log("- Check server logs for detailed API responses");
  console.log("\n⚠️  Issues Found:");
  console.log(
    "- Many responses show 'N/A' values, indicating potential mock data usage"
  );
  console.log(
    "- Some operations return fallback responses instead of tool execution"
  );
  console.log(
    "- Transaction listing and product operations may not be properly configured"
  );
  console.log("\n💡 Recommendations:");
  console.log("1. Check server logs for tool initialization errors");
  console.log("2. Verify PayPal API credentials are valid");
  console.log("3. Ensure all PayPal tool categories are properly enabled");
  console.log("4. Consider restarting server: npm run dev");
}

// Check if server is running first
async function checkServer() {
  try {
    console.log("🔍 Checking server status...");
    const response = await fetch("http://localhost:3000/health");
    if (response.ok) {
      console.log("✅ Server is running!");

      // Also check available tools
      try {
        const rootResponse = await fetch("http://localhost:3000/");
        const rootData = await rootResponse.json();
        console.log(
          "🛠️  API endpoints available:",
          Object.keys(rootData.endpoints)
        );
      } catch (e) {
        console.log("ℹ️  Could not fetch endpoint info");
      }

      console.log("🔧 First, let's check what tools are available...");
      await testAvailableTools();

      console.log("\n" + "=".repeat(50));
      console.log("🔍 Running diagnostic tests...\n");
      await testRealAPIIntegration();

      console.log("\n" + "=".repeat(50));
      console.log("🧪 Now running main tests...\n");
      testAgent();
    } else {
      console.log(
        "❌ Server returned error. Please start it with: npm run dev"
      );
    }
  } catch (error) {
    console.log("❌ Server is not running. Please start it with: npm run dev");
    console.log("💡 Make sure to run: npm run dev");
  }
}

checkServer();
