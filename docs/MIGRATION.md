# File Organization Migration Guide

This guide documents the reorganization of the PayPal Agent Toolkit project structure.

## Changes Made

### Directory Structure

- Created `/tests` directory for all test files
- Created `/scripts` directory for utility scripts
- Created `/docs` directory for documentation
- Organized `/src` into subdirectories:
  - `/src/agents` - Agent implementations
  - `/src/tools` - PayPal tool integrations
  - `/src/llm` - Language model implementations

### File Moves

#### Test Files → `/tests`

- `test-client.js` → `tests/test-client.js`
- `test-invoice-details.js` → `tests/test-invoice-details.js`
- `test-invoice-workflow.js` → `tests/test-invoice-workflow.js`
- `test-order-workflow.js` → `tests/test-order-workflow.js`

#### Scripts → `/scripts`

- `capture-order.js` → `scripts/capture-order.js`
- `check-invoice-status.js` → `scripts/check-invoice-status.js`
- `get-invoice-link.js` → `scripts/get-invoice-link.js`

#### Documentation → `/docs`

- `PROJECT-SUMMARY.md` → `docs/PROJECT-SUMMARY.md`
- Added `docs/STRUCTURE.md` (new)
- Added `docs/MIGRATION.md` (this file)

#### Source Code Organization

- `src/agent*.ts` → `src/agents/`
- `src/paypal-tools*.ts` → `src/tools/`
- `src/ollama-llm.ts` → `src/llm/`

### Updated Files

#### Import Path Updates

- `src/server.ts` - Updated import for `agent-improved`
- `src/agents/agent-improved.ts` - Updated imports for tools and LLM
- `src/agents/agent.ts` - Updated imports for tools and LLM

#### Configuration Updates

- `package.json` - Added new NPM scripts for organized structure
- `tsconfig.json` - Added path aliases and updated excludes
- `README.md` - Updated with new structure information

### New NPM Scripts

```bash
# Testing
npm test              # Main test suite
npm run test:invoice  # Invoice workflow tests
npm run test:order    # Order workflow tests
npm run test:details  # Invoice details tests

# Scripts
npm run script:capture [ORDER_ID]    # Capture order
npm run script:check [INVOICE_ID]    # Check invoice
npm run script:link [INVOICE_ID]     # Get payment link

# Development (unchanged)
npm run dev          # Development server
npm run build        # Build project
npm start           # Production server
```

## Benefits

1. **Better Organization**: Clear separation of concerns
2. **Easier Navigation**: Related files grouped together
3. **Improved Maintainability**: Logical structure for scaling
4. **Enhanced Developer Experience**: Clear NPM scripts for common tasks
5. **Documentation**: Comprehensive guides and structure docs

## Breaking Changes

- Import paths in source files have been updated
- NPM script names have been expanded (old scripts still work)
- File locations have changed (update any external references)

## Migration Complete

All files have been successfully moved and import paths updated. The project should continue to work as before with the new organized structure.
