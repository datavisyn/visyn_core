import { createBinLookup } from './create-bin-lookup';

// NOTE: @dv-usama-ansari: Copied from `BarRandom.stories.tsx`
function RNG(seed: number, sign: 'positive' | 'negative' | 'mixed' = 'positive') {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return () => {
    let value = ((s = (s * a) % m) / m) * 2 - 1; // Generate values between -1 and 1
    if (sign === 'positive') {
      value = Math.abs(value);
    } else if (sign === 'negative') {
      value = -Math.abs(value);
    }
    return value;
  };
}

describe('Create bin lookup', () => {
  it('should return a map', () => {
    expect(createBinLookup([])).toBeInstanceOf(Map);
  });

  it('should return a map with the correct number of bins', () => {
    const binLookup = createBinLookup(
      Array.from({ length: 10 }, (_, i) => ({ id: String(i), val: i })),
      5,
    );
    const bins = Array.from(new Set([...binLookup.values()]));

    expect(bins.length).toBe(5);
  });

  it('should return fewer bins irrespective of maxBins for small data', () => {
    const binLookup = createBinLookup(
      Array.from({ length: 3 }, (_, i) => ({ id: String(i), val: i })),
      8,
    );
    const bins = Array.from(new Set([...binLookup.values()]));

    expect(bins.length).toBe(2);
  });

  it('should return correct bins for a single element', () => {
    const binLookup = createBinLookup([{ id: '1', val: 1 }]);
    const bins = Array.from(new Set([...binLookup.values()]));
    expect(bins).toEqual(['1']);
  });

  it('should return correct bins for null values', () => {
    const binLookup = createBinLookup(Array.from({ length: 3 }, (_, i) => ({ id: String(i), val: null })));
    const bins = Array.from(new Set([...binLookup.values()]));
    expect(bins).toEqual(['Unknown']);
  });

  it('should return maximum of 8 bins for very large data', () => {
    const binLookup = createBinLookup(Array.from({ length: 1001 }, (_, i) => ({ id: String(i), val: i })));
    const bins = Array.from(new Set([...binLookup.values()]));
    expect(bins.length).toBe(8);
    expect(bins).toEqual(['0 to 125', '125 to 250', '250 to 375', '375 to 500', '500 to 625', '625 to 750', '750 to 875', '875 to 1000']);
  });

  it('should return correct number bins for high precision floating point numbers', () => {
    const binLookup = createBinLookup(
      Array.from({ length: 10 }, (_, i) => {
        const val = RNG(i * 100, 'mixed')() * 100;
        return {
          id: String(i),
          val,
        };
      }),
      5,
    );
    const bins = Array.from(new Set([...binLookup.values()]));

    expect(new Set([...binLookup.values()]).size).toBe(5);
    expect(bins).toEqual([
      '-100 to -99.8052758162947',
      '-99.8052758162947 to -99.61055163258939',
      '-99.6105516325894 to -99.4158274488841',
      '-99.4158274488841 to -99.2211032651788',
      '-99.22110326517881 to -99.02637908147351',
    ]);
  });
});
