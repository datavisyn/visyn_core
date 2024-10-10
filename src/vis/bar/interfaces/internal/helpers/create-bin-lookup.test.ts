import { createBinLookup } from './create-bin-lookup';

describe('createBinLookup', () => {
  it('should create a bin lookup map based on the provided data and maximum number', () => {
    // TODO: @dv-usama-ansari: Add tests for createBinLookup for different combinations of data and maxBins:
    //  - data: empty array
    //  - data: single element
    //  - data: multiple elements
    //  - data: null values
    //  - data: very large number of elements
    //  - data: high precision floating point numbers for a small range
    //  - maxBins: 0
    //  - maxBins: 8
    //  - maxBins: null

    const binLookup = createBinLookup([]);
    expect(binLookup).toBeInstanceOf(Map);
  });
});
