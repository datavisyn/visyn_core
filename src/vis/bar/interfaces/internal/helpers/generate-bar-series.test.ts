import { defaultConfig } from '../../constants';
import { generateBarSeries } from './generate-bar-series';

const config = { ...defaultConfig };

// TODO: @dv-usama-ansari: Add more test cases
describe('generateBarSeries', () => {
  it('should return a series object for the given data', () => {
    const data: Parameters<typeof generateBarSeries>['0'] = {
      categories: {},
      categoriesList: [],
      groupingsList: [],
    };
    const series = generateBarSeries(data, {
      aggregateType: config.aggregateType,
      display: config.display,
      facets: config.facets,
      group: config.group,
      groupType: config.groupType,
    });
    expect(series).toBeInstanceOf(Array);
  });
});
