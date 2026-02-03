import { describe, it, expect } from 'vitest';
import { getCommaSeparatedStringFromStringOrArray } from '../string';

describe('getCommaSeparatedStringFromStringOrArray', () => {
  it('should return same string if not array', () => {
    expect(getCommaSeparatedStringFromStringOrArray('test')).toEqual('test');
  });
  it('should return comma separated string if multiple strings in array', () => {
    expect(getCommaSeparatedStringFromStringOrArray(['test1', 'test2'])).toEqual('test1,test2');
  });
  it('should return empty string for empty array', () => {
    expect(getCommaSeparatedStringFromStringOrArray([])).toEqual('');
  });
});
