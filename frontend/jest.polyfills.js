// Jest setup polyfills for jsdom environment
// This runs BEFORE jest setup files, ensuring globals are available

const { TextDecoder, TextEncoder } = require('node:util');

// Polyfill TextEncoder/TextDecoder for MSW and jsPDF in JSDOM
// jsPDF specifically sometimes expects these on the global and window objects directly

Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder, writable: true, configurable: true },
    TextEncoder: { value: TextEncoder, writable: true, configurable: true },
});

if (typeof global !== 'undefined') {
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

if (typeof window !== 'undefined') {
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder;
}
