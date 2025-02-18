import { getDataForAggregationType } from './get-data-for-aggregate-type';
import { NAN_REPLACEMENT } from '../../../../general/constants';
import { defaultConfig } from '../../constants';
import { DEFAULT_BAR_CHART_HEIGHT, DEFAULT_BAR_CHART_MIN_WIDTH } from '../constants';

const config = { ...defaultConfig };

// TODO: @dv-usama-ansari: Add more test cases
describe('getDataForAggregationType', () => {
  it('should return an instance of an array', () => {
    const aggregatedData: Parameters<typeof getDataForAggregationType>['0'] = {
      categories: {},
      categoriesList: [],
      groupingsList: [],
      facetHeight: DEFAULT_BAR_CHART_HEIGHT,
      facetMinWidth: DEFAULT_BAR_CHART_MIN_WIDTH,
    };
    const data = getDataForAggregationType(aggregatedData, config, NAN_REPLACEMENT, 'selected');
    expect(data).toBeInstanceOf(Array);
  });
});
