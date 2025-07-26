# PayPal Agent Toolkit

A complete PayPal commerce assistant built with LangChain and Ollama for local LLM processing.

## Features

- 📊 Check payment status
- 📄 Generate invoices
- 📦 Track shipments
- 💰 Process refunds
- 🤖 Natural language processing
- 🔒 Completely local and free

## Quick Start

### 1. Prerequisites
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull a model (in another terminal)
ollama pull llama3.1:8b
```

### 2. Setup
```bash
# Install dependencies
npm install

# Update .env with your PayPal sandbox credentials
# Get them from: https://developer.paypal.com/

# Start the server
npm run dev
```

### 3. Test
```bash
# In another terminal
npm test
```

## API Usage

### Chat Endpoint
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a payment for $50"}'
```

### Example Messages
- "Create a payment for $50"
- "Create a payment for $25.99 in EUR"
- "Check payment status for PAY-123456789"
- "Create an invoice for john@example.com for $100"
- "Track shipment 1Z999AA1234567890"
- "Process a refund for payment PAY-123456789 for $25"

## Environment Variables

```env
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_ENVIRONMENT=sandbox

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Server Configuration
PORT=3000
```

## Development

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Next Steps

1. Replace sandbox credentials with production ones
2. Add authentication
3. Create a web frontend
4. Deploy to cloud platforms
5. Add more PayPal API integrations

## Troubleshooting

- Ensure Ollama is running: `ollama serve`
- Check if model is available: `ollama list`
- Verify PayPal credentials in .env file
- Check server logs for detailed error messages
