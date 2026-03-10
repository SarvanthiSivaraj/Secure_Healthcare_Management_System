if (typeof global !== 'undefined' && !global.TextEncoder) {
    const { TextEncoder, TextDecoder } = require('node:util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
    if (typeof window !== 'undefined') {
        window.TextEncoder = TextEncoder;
        window.TextDecoder = TextDecoder;
    }
}

import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Robust mock for matchMedia which is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
