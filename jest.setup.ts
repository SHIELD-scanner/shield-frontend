// Setup file for Jest (TypeScript version)

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Import required polyfills for Next.js API routes
import { TextEncoder, TextDecoder } from 'util';

// Set test environment - use Object.assign to avoid readonly error
Object.assign(process.env, { NODE_ENV: "test" });

// Mock Next.js environment variables
process.env.BACKEND_API = "http://localhost:8000";

// Add polyfills for Next.js API routes in jsdom environment
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  AbortController: class MockAbortController {
    signal: any;
    
    constructor() {
      this.signal = {
        aborted: false,
        reason: null,
        onabort: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        throwIfAborted() {
          if (this.aborted) {
            throw this.reason || new Error('Aborted');
          }
        }
      };
    }
    
    abort(reason?: any) {
      if (!this.signal.aborted) {
        this.signal.aborted = true;
        this.signal.reason = reason;
        if (this.signal.onabort) {
          this.signal.onabort();
        }
      }
    }
  },
  AbortSignal: {
    timeout: (milliseconds: number) => ({
      aborted: false,
      reason: null,
      onabort: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      throwIfAborted() {
        if (this.aborted) {
          throw this.reason || new Error('Timeout');
        }
      }
    })
  },
  Request: class MockRequest {
    private _url: string;
    private _method: string;
    private _headers: Map<string, string>;
    private _body: any;
    
    constructor(url: string, init?: RequestInit) {
      this._url = url;
      this._method = init?.method || 'GET';
      this._headers = new Map();
      this._body = init?.body;
      
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => this._headers.set(key, value));
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => this._headers.set(key, value));
        } else {
          Object.entries(init.headers).forEach(([key, value]) => 
            this._headers.set(key, value)
          );
        }
      }
    }
    
    get url() {
      return this._url;
    }
    
    get method() {
      return this._method;
    }
    
    get headers() {
      return this._headers;
    }
    
    get body() {
      return this._body;
    }
    
    json() {
      return Promise.resolve(JSON.parse(this._body || '{}'));
    }
  },
  Response: class MockResponse {
    private _status: number;
    private _statusText: string;
    private _headers: Map<string, string>;
    private _body: any;
    private _ok: boolean;
    
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._body = body;
      this._status = init?.status || 200;
      this._statusText = init?.statusText || 'OK';
      this._ok = this._status >= 200 && this._status < 300;
      this._headers = new Map();
      
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => this._headers.set(key, value));
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => this._headers.set(key, value));
        } else {
          Object.entries(init.headers).forEach(([key, value]) => 
            this._headers.set(key, value)
          );
        }
      }
    }
    
    get status() {
      return this._status;
    }
    
    get statusText() {
      return this._statusText;
    }
    
    get ok() {
      return this._ok;
    }
    
    get headers() {
      return this._headers;
    }
    
    get body() {
      return this._body;
    }
    
    json() {
      try {
        return Promise.resolve(typeof this._body === 'string' ? JSON.parse(this._body) : this._body);
      } catch (error) {
        return Promise.reject(new Error(`Invalid JSON: ${this._body}`));
      }
    }
    
    text() {
      return Promise.resolve(typeof this._body === 'string' ? this._body : JSON.stringify(this._body));
    }
    
    // Static method for creating JSON responses (Next.js style)
    static json(data: any, init?: ResponseInit) {
      // Allow this method to be mocked in tests
      const response = new MockResponse(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {})
        }
      });
      return response;
    }
  },
  Headers: class MockHeaders extends Map {
    constructor(init?: HeadersInit) {
      super();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    get(name: string) {
      return super.get(name.toLowerCase()) || null;
    }
    
    set(name: string, value: string) {
      super.set(name.toLowerCase(), value);
      return this;
    }
    
    has(name: string) {
      return super.has(name.toLowerCase());
    }
    
    delete(name: string) {
      return super.delete(name.toLowerCase());
    }
    
    forEach(callbackfn: (value: string, key: string, parent: Map<any, any>) => void) {
      super.forEach((value, key) => callbackfn(value, key, this));
    }
  }
});

// Mock fetch globally if not already available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Clean up mocks after each test
afterEach(() => {
  if (jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  }
  // Clear all timers to prevent hanging
  jest.clearAllTimers();
});

// Clear all timers after all tests
afterAll(() => {
  jest.clearAllTimers();
});
