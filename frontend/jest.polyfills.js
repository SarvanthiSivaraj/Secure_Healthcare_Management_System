// Jest setup polyfills for jsdom environment
// This runs BEFORE jest setup files, ensuring globals are available

const { TextDecoder, TextEncoder } = require('node:util');

Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
});
