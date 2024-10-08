import { EBarDirection, EBarSortState } from '../../enums';
import { sortSeries } from './sort-series';

describe('sortSeries', () => {
  // TODO: @dv-usama-ansari: Add tests for sortSeries for different combinations of data:
  //  - series: empty array
  //  - series: very large number of elements
  //  - series: null values
  //  - test for all configurations of sortMetadata
  it('should return an array of sorted series', () => {
    const series: Parameters<typeof sortSeries>['0'] = [];
    const sortMetadata: Parameters<typeof sortSeries>['1'] = {
      direction: EBarDirection.HORIZONTAL,
      sortState: { x: EBarSortState.NONE, y: EBarSortState.NONE },
    };
    const sortedSeries = sortSeries(series, sortMetadata);
    expect(sortedSeries).toBeInstanceOf(Array);
  });
});
