# Invoice Testing Suite Docum9. Cancel a sent invoice

10. Get invoice payment link
11. Create invoice with tax and shipping
12. Create recurring invoice templatetion

This directory contains comprehensive testing for all PayPal Invoice features. The tests are designed to validate each invoice function thoroughly while maintaining your existing workflow.

## 📋 Test Files Overview

### 1. `test-invoice-features.js`

**Purpose**: Tests all individual invoice features with comprehensive scenarios

**Features Tested**:

- ✅ `create_invoice` - Invoice creation with various parameters
- ✅ `get_invoice` - Individual invoice detail retrieval
- ✅ `send_invoice` - Invoice sending functionality
- ✅ `send_invoice_reminder` - Payment reminder system
- ✅ `generate_invoice_qr_code` - QR code generation for payments
- ✅ `cancel_sent_invoice` - Invoice cancellation process

**Test Scenarios** (12 tests):

1. Create detailed invoice with line items
2. Create simple invoice with minimal details
3. Create invoice with custom invoice number
4. Get invoice details by ID
5. Get invoice details with non-existent ID
6. Send an existing invoice
7. Send invoice reminder
8. Generate QR code for invoice payment
9. Cancel a sent invoice
10. Get invoice payment link
11. Create invoice with tax and shipping
12. Create recurring invoice template

**Usage**:

```bash
npm run test:invoice-features
```

### 2. `test-invoice-workflows.js`

**Purpose**: Tests complete invoice workflows and business processes

**Workflows Tested**:

#### Workflow 1: Complete Invoice Lifecycle

- Create → Send → Remind → Cancel workflow
- Tests the full invoice management process
- Validates each step in sequence

#### Workflow 2: Bulk Invoice Management

- Create multiple invoices
- List and manage them in bulk
- Send multiple invoices at once

#### Workflow 3: Invoice Error Handling

- Tests error scenarios and edge cases
- Invalid invoice IDs
- Non-existent operations
- Malformed requests

#### Workflow 4: Advanced Invoice Features

- Detailed invoices with line items
- Custom payment terms
- Discount handling
- Status filtering
- Amount-based searching

**Usage**:

```bash
npm run test:invoice-workflows
```

### 3. `test-invoice-functions.js`

**Purpose**: Deep testing of each individual invoice function

**Function Testing**:

- Each of the 7 core invoice functions tested individually
- Multiple test cases per function
- Error handling validation
- Edge case coverage

**Functions Covered**:

1. **testCreateInvoice()**: 3 test cases

   - Basic invoice creation
   - Invoice with detailed description
   - High-value invoice

2. **testListInvoices()**: 5 test cases

   - List all invoices
   - List with pagination
   - List SENT invoices only
   - List PAID invoices only
   - List recent invoices

3. **testGetInvoice()**: 3 test cases

   - Get existing invoice
   - Get non-existent invoice
   - Get invoice with malformed ID

4. **testSendInvoice()**: 3 test cases

   - Send newly created invoice
   - Send another invoice
   - Send non-existent invoice

5. **testSendInvoiceReminder()**: 3 test cases

   - Send reminder for sent invoice
   - Send reminder with custom message
   - Send reminder for non-existent invoice

6. **testGenerateInvoiceQR()**: 3 test cases

   - Generate QR for new invoice
   - Generate QR with specific size
   - Generate QR for non-existent invoice

7. **testCancelInvoice()**: 4 test cases
   - Cancel sent invoice
   - Cancel with reason
   - Cancel non-existent invoice
   - Cancel already cancelled invoice

**Usage**:

```bash
npm run test:invoice-functions
```

## 🚀 Quick Start

1. **Ensure server is running**:

   ```bash
   npm run dev
   ```

2. **Run all invoice tests**:

   ```bash
   # Test individual features
   npm run test:invoice-features

   # Test complete workflows
   npm run test:invoice-workflows

   # Test each function in detail
   npm run test:invoice-functions
   ```

3. **Run your existing tests** (unchanged):
   ```bash
   npm run test:comprehensive
   npm run test:new-features
   ```

## 📊 Test Output Analysis

### Success Indicators

- 🎉 **SUCCESS** - Operation completed successfully
- ✅ **Response** - Positive response received
- 📄 **Invoice ID** - Valid invoice created (INV2-XXXX-XXXX-XXXX-XXXX)

### Issue Indicators

- ⚠️ **ISSUE DETECTED** - Error in response
- ❌ **Error** - Operation failed
- 🔧 **TOOL MISSING** - Function not available

### Info Indicators

- ℹ️ **INFO** - General response provided
- 📋 **Created Invoice IDs** - List of successfully created invoices

## 🔧 Configuration

### Environment Variables Required

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

### Test Configuration

- **Server URL**: http://localhost:3000
- **Timeout**: 10-15 seconds per request
- **Delay Between Tests**: 1-3 seconds
- **Retry Logic**: Built-in error handling

## 📈 Test Metrics

### Coverage

- **6 Core Functions**: 100% covered
- **12 Feature Tests**: Comprehensive scenarios
- **4 Workflow Tests**: End-to-end processes
- **18 Function Tests**: Deep individual testing

### Success Criteria

- ✅ Invoice creation successful
- ✅ Invoice IDs returned properly
- ✅ PayPal API integration working
- ✅ Error handling functional
- ✅ Business workflows complete

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**

   ```
   ❌ Server is not running on http://localhost:3000
   ```

   **Solution**: Run `npm run dev` first

2. **PayPal API Errors**

   ```
   PayPal API error (404): [object Object]
   ```

   **Solution**: Check environment variables and PayPal sandbox account

3. **Timeout Errors**

   ```
   Request timeout
   ```

   **Solution**: Increase timeout or check network connection

4. **Invalid Invoice IDs**
   ```
   Invoice not found
   ```
   **Solution**: Use invoice IDs from test output or create new ones

### Debug Mode

Add detailed logging by modifying test files:

```javascript
console.log("🔍 Debug:", response);
```

## 📝 Test Results Interpretation

### Feature Test Results

- **Successful Operations**: Look for invoice IDs and success messages
- **Failed Operations**: Check error messages for PayPal API issues
- **Partial Success**: Operations that complete but with warnings

### Workflow Test Results

- **Complete Workflows**: All steps in sequence successful
- **Partial Workflows**: Some steps succeed, others fail
- **Failed Workflows**: Critical errors prevent completion

### Function Test Results

- **Per-Function Success Rate**: Percentage of tests passing per function
- **Overall Success Rate**: Total tests passing across all functions
- **Error Patterns**: Common failure types across functions

## 🔄 Integration with Existing Tests

These new invoice tests are designed to **complement** your existing test suite:

- **Preserves**: Your current `test-comprehensive.js` and `test-new-features.js`
- **Extends**: Adds detailed invoice-specific testing
- **Enhances**: Provides granular function-level validation
- **Maintains**: All existing npm scripts and workflows

## 📚 Next Steps

1. **Run Tests**: Execute each test suite to validate your setup
2. **Review Results**: Analyze success rates and error patterns
3. **Configure PayPal**: Ensure sandbox credentials are properly set
4. **Customize Tests**: Modify test data and scenarios as needed
5. **Monitor**: Use for ongoing validation of invoice functionality

## 🎯 Testing Best Practices

1. **Run in Sequence**: Don't run multiple test suites simultaneously
2. **Check Server**: Always verify server is running first
3. **Review Logs**: Check both test output and server logs
4. **Clean Data**: Regularly check PayPal sandbox for test invoices
5. **Update Tests**: Modify test data to match your business needs

---

**Happy Testing!** 🎉

These comprehensive invoice tests will help ensure your PayPal Agent Toolkit invoice functionality is robust and reliable.
