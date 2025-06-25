# 🧪 Testing Guide

Comprehensive testing suite for the KijayKolder LinksHub Music Player, covering database operations, API routes, and file handling.

## 🚀 Quick Start

### Run All Tests

```bash
npm test
# or
./scripts/test.sh
```

### Run Specific Test Types

```bash
npm run test:unit    # Unit tests only
npm run test:db      # Database tests (requires Supabase)
npm run test:api     # API route tests
npm run test:coverage # Tests with coverage report
npm run test:watch   # Watch mode for development
```

## 📋 Test Categories

### 1. Unit Tests (`tests/unit/`)

**Purpose**: Test individual functions and components in isolation
**Dependencies**: None (mocked)
**Speed**: Fast

**Coverage**:

- ✅ Supabase API functions (trackApi, videoApi, fileApi)
- ✅ Data validation and transformation
- ✅ Error handling
- ✅ File upload operations
- ✅ Metadata processing

**Run**: `npm run test:unit`

### 2. Database Tests (`tests/db/`)

**Purpose**: Test actual database operations with Supabase
**Dependencies**: Supabase running locally
**Speed**: Medium

**Coverage**:

- ✅ CRUD operations for tracks
- ✅ CRUD operations for background videos
- ✅ File storage operations
- ✅ Metadata extraction
- ✅ Real-time subscriptions
- ✅ Row Level Security (RLS)
- ✅ Data validation at database level

**Run**: `npm run test:db`

### 3. API Tests (`tests/api/`)

**Purpose**: Test HTTP API endpoints
**Dependencies**: None (mocked)
**Speed**: Fast

**Coverage**:

- ✅ Metadata extraction endpoint
- ✅ File upload endpoints
- ✅ Error handling
- ✅ Request validation
- ✅ Response formatting
- ✅ CORS handling

**Run**: `npm run test:api`

## 🛠 Test Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Start Supabase (for database tests)
npm run supabase:start
```

### Environment Variables

Create `.env.test` for test-specific configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

## 📊 Test Coverage

### Database Operations

```typescript
// Track API Tests
describe("Track API", () => {
  it("should create a new track");
  it("should get all active tracks");
  it("should update track metadata");
  it("should delete tracks");
  it("should toggle active status");
  it("should handle file operations");
  it("should validate data constraints");
});

// Video API Tests
describe("Video API", () => {
  it("should create background videos");
  it("should manage video active states");
  it("should handle video file uploads");
});
```

### File Operations

```typescript
// File Upload Tests
describe("File API", () => {
  it("should upload audio files");
  it("should upload video files");
  it("should upload images");
  it("should handle file size limits");
  it("should validate file types");
  it("should generate public URLs");
});
```

### API Endpoints

```typescript
// Metadata Extraction Tests
describe("Extract Metadata API", () => {
  it("should extract metadata from audio files");
  it("should handle different file formats");
  it("should generate waveform data");
  it("should estimate duration");
  it("should handle errors gracefully");
});
```

## 🔧 Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Database Test Setup

```typescript
// tests/db-setup.ts
export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createTestTrack = (overrides = {}) => ({
  title: "Test Track",
  artist: "Test Artist",
  // ... default test data
  ...overrides,
});
```

## 🧹 Test Cleanup

### Automatic Cleanup

Tests automatically clean up after themselves:

```typescript
afterEach(async () => {
  await cleanupTestData();
});
```

### Manual Cleanup

```bash
# Clean up test data
npm run supabase:reset

# Clean up Docker resources
npm run docker:cleanup
```

## 📈 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### Coverage Targets

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### View Coverage

```bash
# Open coverage report
open coverage/index.html
```

## 🐛 Debugging Tests

### Run Tests in Debug Mode

```bash
# Run specific test with debug output
npx vitest run --reporter=verbose tests/db/track-api.test.ts

# Run tests with UI
npx vitest --ui
```

### Common Issues

#### Supabase Connection Issues

```bash
# Check Supabase status
npm run supabase:status

# Restart Supabase
npm run supabase:stop
npm run supabase:start
```

#### Docker Issues

```bash
# Check Docker status
npm run docker:status

# Restart Docker
npm run docker:restart
```

#### Test Dependencies

```bash
# Reinstall test dependencies
rm -rf node_modules
npm install
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:api
      - run: npm run test:coverage
```

## 📝 Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { functionToTest } from "@/lib/function";

describe("Function Name", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something", async () => {
    // Arrange
    const input = "test";

    // Act
    const result = await functionToTest(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Database Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { trackApi } from "@/lib/supabase";
import { createTestTrack, cleanupTestData } from "../db-setup";

describe("Database Operation", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("should perform database operation", async () => {
    const testData = createTestTrack();
    const result = await trackApi.create(testData);
    expect(result).toBeDefined();
  });
});
```

## 🎯 Best Practices

### Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up after each test

### Mocking

- Mock external dependencies
- Use realistic test data
- Test error conditions
- Verify mock calls

### Database Tests

- Use isolated test data
- Clean up after tests
- Test both success and failure cases
- Verify data integrity

### Performance

- Keep tests fast
- Use appropriate timeouts
- Avoid unnecessary setup/teardown
- Run tests in parallel when possible

## 🆘 Troubleshooting

### Test Failures

1. Check Supabase is running
2. Verify environment variables
3. Check Docker status
4. Review test logs
5. Run tests individually

### Performance Issues

1. Use test isolation
2. Optimize database queries
3. Reduce test data size
4. Use appropriate timeouts

### Coverage Issues

1. Add missing test cases
2. Check for untested branches
3. Verify error handling
4. Test edge cases

---

For more information, see the [main README](README.md) or create an issue on GitHub.
