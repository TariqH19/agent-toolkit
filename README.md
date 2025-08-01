# PayPal Agent Toolkit

A complete PayPal commerce assistant built with LangChain and Ollama for local LLM processing. Features comprehensive invoice management with payment links and order processing workflows.

## 📁 Project Structure

```
paypal-agent-toolkit/
├── src/                          # Source code
│   ├── agents/                   # AI agent implementations
│   ├── tools/                    # PayPal API integrations
│   ├── llm/                      # Language model setup
│   └── server.ts                 # Express server
├── tests/                        # Test suites
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
```

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for detailed structure information.

## ✨ Features

### 📧 Invoice Management

- ✅ **Create invoices** with automatic payment link generation
- ✅ **Check payment status** (PAID, SENT, DRAFT, etc.)
- ✅ **Extract payment links** for customer sharing
- ✅ **Real-time status tracking** with detailed invoice information
- ✅ **Customer payment** without PayPal account required

### 💳 Order Processing

- ✅ **Create orders** with approval URL generation
- ✅ **Get approval URLs** for customer payment
- ✅ **Capture payments** after customer approval
- ✅ **Order status tracking** throughout the workflow

### 🛠️ Additional Features

- � Transaction listing and monitoring
- 📦 Shipment tracking integration
- 💰 Refund processing capabilities
- 🤖 Natural language processing for all operations
- 🔒 Completely local and free LLM processing

## 🚀 Quick Start

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

### 3. Test the Workflows

```bash
# Test complete invoice workflow
node tests/invoices/test-invoice-workflow.js

# Test complete order workflow
npm run test:order

# Test invoice details
npm run test:details

# Run main test suite
npm test

# Manual scripts
npm run script:capture [ORDER_ID]    # Capture approved order
npm run script:check [INVOICE_ID]    # Check invoice status
npm run script:link [INVOICE_ID]     # Get payment link
```

## 🔧 API Usage

### Chat Endpoint

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create an invoice for usth@personal.com for $50 for Web Development"}'
```

### 📧 Invoice Examples

```bash
# Create invoice with payment link
"Create an invoice for usth@personal.com for $50 for Web Development Services"

# Check if invoice has been paid
"Check invoice INV2-XXXX-XXXX-XXXX-XXXX"

# Get payment link for existing invoice
"Get payment link for invoice INV2-XXXX-XXXX-XXXX-XXXX"

# Get detailed invoice information
"Get invoice INV2-XXXX-XXXX-XXXX-XXXX"
```

### 💳 Order Examples

```bash
# Create order with approval URL
"Create an order for $25"

# Get order details and approval URL
"Get details for order 1AB23456CD789012E"

# Capture approved order
"Capture payment for order 1AB23456CD789012E"
```

### 📊 Other Operations

```bash
# List transactions
"List my recent transactions"

# List invoices
"List all my invoices"

# Track shipment
"Track shipment 1Z999AA1234567890"

# Process refund
"Process a refund for payment PAY-123456789 for $25"
```

## 🛠️ Test Workflows

### Complete Invoice Workflow

```bash
# Creates invoice → Gets payment link → Checks status
node tests/invoices/test-invoice-workflow.js

# Check specific invoice status
node check-invoice-status.js INV2-XXXX-XXXX-XXXX-XXXX

# Get payment link for specific invoice
node get-invoice-link.js INV2-XXXX-XXXX-XXXX-XXXX
```

### Complete Order Workflow

```bash
# Creates order → Gets approval URL → Shows capture command
node test-order-workflow.js

# Capture specific approved order
node capture-order.js 1AB23456CD789012E
```

## 📋 Workflow Examples

### 📧 Invoice Payment Link Workflow

1. **Create Invoice**: `node tests/invoices/test-invoice-workflow.js`

   - Creates invoice for $50
   - Automatically generates payment link
   - Status: SENT

2. **Share Payment Link**: Customer receives

   - `https://www.sandbox.paypal.com/invoice/p/#INV2-XXXX-XXXX-XXXX-XXXX`
   - Customer can pay without PayPal account

3. **Check Payment**: `node check-invoice-status.js INV2-XXXX-XXXX-XXXX-XXXX`
   - Status: PAID ✅
   - Shows payment details and transaction ID

### 💳 Order Approval Workflow

1. **Create Order**: `node test-order-workflow.js`

   - Creates order for $25
   - Gets approval URL: `https://www.sandbox.paypal.com/checkoutnow?token=ORDER_ID`

2. **Customer Approval**: Open approval URL

   - Customer logs into PayPal
   - Approves payment

3. **Capture Payment**: `node capture-order.js ORDER_ID`
   - Captures the approved payment
   - Status: COMPLETED ✅

## ⚙️ Environment Variables

```env
# PayPal Sandbox Credentials (Required)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_ENVIRONMENT=sandbox

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Server Configuration
PORT=3000
```

### 🔑 Getting PayPal Credentials

1. Visit [PayPal Developer Dashboard](https://developer.paypal.com/developer/accounts/)
2. Create a new application
3. Copy Client ID and Client Secret
4. Use **sandbox** credentials for testing
5. Switch to **live** credentials for production

## 💻 Development

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Test invoice workflow
node tests/invoices/test-invoice-workflow.js

# Test order workflow
node tests/test-order-workflow.js
```

## 📁 Project Structure

```
paypal-agent-toolkit/
├── src/
│   ├── agent-improved.ts     # Main PayPal agent with invoice/order logic
│   ├── server.ts            # Express server
│   └── paypal-tools.ts      # PayPal API tool definitions
├── tests/
│   ├── invoices/            # Invoice-specific tests
│   │   ├── test-invoice-workflow.js # Complete invoice testing
│   │   ├── test-invoice-features.js # Invoice features testing
│   │   ├── test-invoice-workflows.js # Invoice workflow testing
│   │   ├── test-invoice-functions.js # Invoice function testing
│   │   └── test-all-invoices.js     # Complete invoice test suite
│   ├── test-client.js       # Main test suite
│   └── test-order-workflow.js # Complete order testing
├── scripts/
│   ├── check-invoice-status.js  # Invoice status checker
│   ├── get-invoice-link.js      # Payment link extractor
│   └── capture-order.js         # Order capture utility
```

````

## 🎯 Key Features Implemented

### ✅ Working Invoice System

- **Automatic payment link generation** during creation
- **Real payment status checking** (PAID, SENT, DRAFT)
- **Customer payment without PayPal account**
- **Complete invoice details** with transaction history

### ✅ Working Order System

- **Order creation** with approval URLs
- **Customer approval workflow**
- **Payment capture** after approval
- **Order status tracking**

### ✅ PayPal API Integration

- **15 PayPal tools** fully integrated
- **Sandbox environment** for safe testing
- **Production ready** with credential switch

## 🚀 Production Deployment

### Next Steps

1. **Replace sandbox credentials** with production ones in `.env`
2. **Add authentication** for API access control
3. **Create web frontend** for user interface
4. **Deploy to cloud platforms** (AWS, Vercel, etc.)
5. **Add webhook handling** for real-time payment notifications
6. **Implement user management** and multi-tenant support

### Security Considerations

- Store PayPal credentials securely
- Use HTTPS in production
- Implement rate limiting
- Add request validation
- Monitor API usage

## 🔧 Troubleshooting

### Common Issues

- **Ollama not running**: Start with `ollama serve`
- **Model not found**: Download with `ollama pull llama3.1:8b`
- **PayPal API errors**: Verify credentials in `.env` file
- **Invoice not paid**: Check actual PayPal sandbox for payment status
- **Order capture fails**: Ensure order was approved by customer first

### Debug Commands

```bash
# Check available tools
curl http://localhost:3000/tools

# Test specific invoice
node check-invoice-status.js INV2-XXXX-XXXX-XXXX-XXXX

# Test specific order capture
node capture-order.js ORDER_ID

# View server logs
npm run dev  # Watch terminal output
````

## 📞 Support

For issues and questions:

- Check server logs for detailed error messages
- Verify PayPal sandbox account status
- Ensure all environment variables are set correctly
- Test with provided workflow scripts first
