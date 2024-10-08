import { defaultConfig } from '../../constants';
import { calculateChartHeight, calculateChartMinWidth } from './calculate-chart-dimensions';

const config = {
  ...defaultConfig,
};

describe('Calculate chart dimensions', () => {
  // TODO: @dv-usama-ansari: Add more tests for different combinations of the following:
  //  - direction
  //  - useResponsiveBarWidth
  //  - groupType
  //  - containerWidth
  //  - useFullHeight
  //  - containerHeight
  //  - aggregatedData small
  //  - aggregatedData large

  it('should return the height of the chart', () => {
    const chartHeight = calculateChartHeight({
      config,
      containerHeight: 150,
      aggregatedData: {
        categories: {},
        categoriesList: [],
        groupingsList: [],
      },
    });
    expect(Number.isNaN(Number(chartHeight))).toBe(false);
  });

  it('should return the minimum width of the chart', () => {
    const chartMinWidth = calculateChartMinWidth({
      config,
      aggregatedData: {
        categories: {},
        categoriesList: [],
        groupingsList: [],
      },
    });
    expect(Number.isNaN(Number(chartMinWidth))).toBe(false);
  });
});
