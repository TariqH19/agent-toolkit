# Project Structure

This document outlines the organized structure of the PayPal Agent Toolkit project.

## Directory Structure

```
paypal-agent-toolkit/
├── src/                          # Source code
│   ├── agents/                   # Agent implementations
│   │   └── agent-improved.ts     # Enhanced agent with PayPal integration
│   ├── tools/                    # PayPal tool integrations
│   │   └── paypal-tools.ts       # PayPal tools implementation
│   ├── llm/                      # Language model integrations
│   │   └── ollama-llm.ts         # Ollama LLM implementation
│   └── server.ts                 # Express server entry point
├── tests/                        # Test files
│   ├── invoices/                 # Invoice-specific tests
│   │   ├── test-invoice-details.js    # Invoice details testing
│   │   ├── test-invoice-workflow.js   # Complete invoice workflow tests
│   │   ├── test-invoice-features.js   # Invoice features testing
│   │   ├── test-invoice-workflows.js  # Invoice workflow testing
│   │   ├── test-invoice-functions.js  # Invoice function testing
│   │   ├── test-all-invoices.js       # Complete invoice test suite
│   │   └── INVOICE-TESTING.md         # Invoice testing documentation
│   ├── test-client.js            # Main test client
│   └── test-order-workflow.js    # Complete order workflow tests
├── scripts/                      # Utility scripts
│   ├── capture-order.js          # Manual order capture utility
│   ├── check-invoice-status.js   # Invoice status checker
│   └── get-invoice-link.js       # Invoice payment link retriever
├── docs/                         # Documentation
│   ├── PROJECT-SUMMARY.md        # Project overview and summary
│   └── STRUCTURE.md              # This file
├── dist/                         # Compiled JavaScript output
├── node_modules/                 # Dependencies
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Project configuration
├── README.md                     # Main project README
└── tsconfig.json                 # TypeScript configuration
```

## Key Components

### `/src` Directory

- **`/agents`**: Contains the main AI agent implementations
- **`/tools`**: PayPal API tool integrations and wrappers
- **`/llm`**: Language model implementations (Ollama)
- **`server.ts`**: Main Express server that serves the agent API

### `/tests` Directory

Contains all testing utilities:

- **Workflow tests**: Complete end-to-end testing scenarios
- **Unit tests**: Individual component testing
- **Integration tests**: API and tool testing

### `/scripts` Directory

Utility scripts for manual operations:

- Order management scripts
- Invoice management scripts
- Status checking utilities

### `/docs` Directory

Project documentation and guides

## Available NPM Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Testing

- `npm test` - Run main test client
- `npm run test:invoice` - Test invoice workflow
- `npm run test:order` - Test order workflow
- `npm run test:details` - Test invoice details
- `npm run test:comprehensive` - Test ALL PayPal features (recommended)
- `npm run test:new-features` - Test new features (products, subscriptions, disputes)

### Scripts

- `npm run script:capture` - Run order capture script
- `npm run script:check` - Run invoice status check
- `npm run script:link` - Get invoice payment link

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Development Workflow

1. Core agent logic goes in `/src/agents`
2. PayPal API integrations go in `/src/tools`
3. Tests go in `/tests`
4. Utility scripts go in `/scripts`
5. Documentation goes in `/docs`
