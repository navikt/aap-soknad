import { getEndOfMonthInLocalTime, getStartOfMonthInLocalTime } from 'utils/date';
import { describe, it, expect } from 'vitest';

describe('getStartOfMonthInLocalTime', () => {
  it('should return start of month in format yyyy-MM-dd', () => {
    expect(getStartOfMonthInLocalTime(new Date('2021-01-01T00:00:00'))).toEqual('2021-01-01');
  });
});

describe('getEndOfMonthInLocalTime', () => {
  it('should return end of month in format yyyy-MM-dd', () => {
    expect(getEndOfMonthInLocalTime(new Date('2021-01-01T00:00:00'))).toEqual('2021-01-31');
  });
  it('should return correct day in leap year', () => {
    expect(getEndOfMonthInLocalTime(new Date('2020-02-01'))).toEqual('2020-02-29');
  });
  it('should return correct day in non-leap year', () => {
    expect(getEndOfMonthInLocalTime(new Date('2021-02-01'))).toEqual('2021-02-28');
  });
});
