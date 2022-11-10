import { formatTelefonnummer } from 'utils/StringFormatters';

describe('formatTelefonnummer', () => {
  it('should correctly format regular phone number with 8 characters', () => {
    expect(formatTelefonnummer('12345678')).toEqual('12 34 56 78');
  });
  it('should correctly format 800-number', () => {
    expect(formatTelefonnummer('80012345')).toEqual('800 12 345');
  });
  it('should correctly format phone number with 5 characters', () => {
    expect(formatTelefonnummer('12345')).toEqual('12345');
  });
  it('should correctly format phone number with country code', () => {
    expect(formatTelefonnummer('+4712345678')).toEqual('+47 12 34 56 78');
  });
  it('should only format phone number with +47 country code', () => {
    expect(formatTelefonnummer('+4812345678')).toEqual('+4812345678');
  });
  it('should not add more than four whitespaces to phone number with country code', () => {
    expect(formatTelefonnummer('+47123456789')).toEqual('+47 12 34 56 789');
  });
});
