/// <reference types="jest" />
import { fromNow } from './fromNow';

function currentPlusSeconds(seconds: number) {
  return new Date(new Date().getTime() + seconds * 1000);
}

describe('fromNow integration tests', () => {
  test('Basic', () => {
    expect(fromNow(currentPlusSeconds(1))).toBe('in 1 second');

    for (let i = 5; i < 60; i += 5) {
      expect(fromNow(currentPlusSeconds(i))).toBe(`in ${i} seconds`);
      expect(fromNow(currentPlusSeconds(-i))).toBe(`${i} seconds ago`);
    }

    expect(fromNow(currentPlusSeconds(60))).toBe('in 1 minute');
    expect(fromNow(currentPlusSeconds(60 * 59))).toBe('in 59 minutes');
    expect(fromNow(currentPlusSeconds(-60 * 59))).toBe('59 minutes ago');

    expect(fromNow(currentPlusSeconds(60 * 60 * 24 * 7))).toBe('next week');
  });
});
