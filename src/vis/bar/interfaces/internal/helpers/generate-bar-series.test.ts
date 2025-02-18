import { generateBarSeries } from './generate-bar-series';
import { defaultConfig } from '../../constants';
import { DEFAULT_BAR_CHART_HEIGHT, DEFAULT_BAR_CHART_MIN_WIDTH } from '../constants';

const config = { ...defaultConfig };

// TODO: @dv-usama-ansari: Add more test cases
describe('generateBarSeries', () => {
  it('should return a series object for the given data', () => {
    const data: Parameters<typeof generateBarSeries>['0'] = {
      categories: {},
      categoriesList: [],
      groupingsList: [],
      facetHeight: DEFAULT_BAR_CHART_HEIGHT,
      facetMinWidth: DEFAULT_BAR_CHART_MIN_WIDTH,
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
