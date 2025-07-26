// Simple test for debugging order creation

const testData = {
  message: "Create an order for $7",
};

async function testOrderCreation() {
  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.text();
    console.log("Order creation response:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testOrderCreation();
