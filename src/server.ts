import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PayPalAgent } from "./agent-improved";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let agent: PayPalAgent;

// Initialize agent
async function initializeAgent() {
  try {
    agent = new PayPalAgent();
    await agent.initialize();
    console.log("✅ PayPal Agent initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize PayPal Agent:", error);
    throw error;
  }
}

// Routes
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`🤖 Processing: "${message}"`);
    const response = await agent.processMessage(message);
    console.log(`✅ Response: ${response}`);

    res.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/tools", (req, res) => {
  try {
    const toolNames = agent
      ? agent["tools"]?.map((tool: any) => tool.name) || []
      : [];
    res.json({
      tools: toolNames,
      count: toolNames.length,
      status: "available",
    });
  } catch (error) {
    res.json({ tools: [], count: 0, status: "error", error: error });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "PayPal Agent Toolkit API",
    endpoints: {
      chat: "POST /chat",
      health: "GET /health",
      tools: "GET /tools",
    },
    example: {
      url: "/chat",
      method: "POST",
      body: { message: "Create a payment for $50" },
    },
  });
});

// Start server
async function startServer() {
  try {
    await initializeAgent();
    app.listen(PORT, () => {
      console.log(`🚀 PayPal Agent Server running on http://localhost:${PORT}`);
      console.log(
        `📝 Try: curl -X POST http://localhost:${PORT}/chat -H "Content-Type: application/json" -d '{"message": "Create a payment for $50"}'`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
