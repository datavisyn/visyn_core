import { median } from './median';

describe('median', () => {
  it('should return the median value of a given array', () => {
    expect(median([1, 2, 3, 4, 5])).toBe(3);
    expect(median([1, 2, 3, 4, 5, 6])).toBe(3.5);
    expect(median([1, 2, 3, 4, 5, 6, 7])).toBe(4);
    expect(median([1, 2, 3, 4, 5, 6, 7, 8])).toBe(4.5);
  });

  it('should return the median value of a given array having negative values', () => {
    expect(median([-1, -2, -3, -4, -5])).toBe(-3);
  });

  it('should return the median value of a given array having negative and positive values', () => {
    expect(median([-1, -2, 3, 4, 5])).toBe(3);
  });

  it('should return the median value of a given array having duplicate values', () => {
    expect(median([1, 2, 3, 3, 4, 5])).toBe(3);
  });

  it('should return the median value of a given array having null values', () => {
    expect(median([1, 2, 3, 4, 5, null] as number[])).toBe(3.5);
  });

  it('should return null if the array is empty', () => {
    expect(median([])).toBe(null);
  });

  it('should filter out Infinity and -Infinity', () => {
    expect(median([1, 2, 3, 4, 5, Infinity])).toBe(3.5);
    expect(median([1, 2, 3, 4, 5, -Infinity])).toBe(3.5);
  });
});
