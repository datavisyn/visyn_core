import { NAN_REPLACEMENT } from '../../../../general';
import { defaultConfig } from '../../constants';
import { getDataForAggregationType } from './get-data-for-aggregate-type';

const config = { ...defaultConfig };

// TODO: @dv-usama-ansari: Add more test cases
describe('getDataForAggregationType', () => {
  it('should return an instance of an array', () => {
    const aggregatedData: Parameters<typeof getDataForAggregationType>['0'] = {
      categories: {},
      categoriesList: [],
      groupingsList: [],
    };
    const data = getDataForAggregationType(aggregatedData, config, NAN_REPLACEMENT, 'selected');
    expect(data).toBeInstanceOf(Array);
  });
});
