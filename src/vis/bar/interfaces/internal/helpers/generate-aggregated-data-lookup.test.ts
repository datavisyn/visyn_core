import { EAggregateTypes } from '../../../../interfaces';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';

describe('Generate aggregated data lookup', () => {
  // TODO: @dv-usama-ansari: Add tests for generateAggregatedDataLookup:
  //  - dataTable: faceted data
  //  - dataTable: non-faceted data
  //  - groupingsList and categoriesList are calculated correctly
  //  - globalMin and globalMax are calculated correctly
  //  - data: sum, count, nums and ids are populated correctly
  //  - **Good to have** check if the function uses multiple threads
  it('should return an instance of object', () => {
    const config: Parameters<typeof generateAggregatedDataLookup>['0'] = {
      isFaceted: false,
      aggregateType: EAggregateTypes.COUNT,
      display: EBarDisplayType.ABSOLUTE,
      groupType: EBarGroupingType.GROUP,
    };
    const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = [];
    const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
    const aggregatedDataLookup = generateAggregatedDataLookup(config, dataTable, selectedMap);
    expect(aggregatedDataLookup).toBeInstanceOf(Object);
  });
});
