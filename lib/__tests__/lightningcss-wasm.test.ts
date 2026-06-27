/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { describe, it, expect } from 'vitest';

describe('lightningcss-wasm', () => {
  it('should transform CSS using the WASM entry point', () => {
    let lc: any;
    expect(() => {
      lc = require('lightningcss');
    }).not.toThrow();

    expect(lc.transform).toBeDefined();
    expect(lc.Features).toBeDefined();

    const result = lc.transform({
      filename: 'test.css',
      code: Buffer.from('.foo { color: red; }'),
      minify: true,
    });
    expect(result.code.toString()).toContain('.foo');
  });
});
