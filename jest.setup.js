// Setup file for Jest

// Set test environment
process.env.NODE_ENV = "test";

// Mock Next.js environment variables
process.env.BACKEND_API = "http://localhost:8000";

// Mock fetch globally if not already available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Clean up mocks after each test
afterEach(() => {
  if (jest.isMockFunction(global.fetch)) {
    global.fetch.mockClear();
  }
  // Clear all timers to prevent hanging
  jest.clearAllTimers();
});

// Clear all timers after all tests
afterAll(() => {
  jest.clearAllTimers();
});
