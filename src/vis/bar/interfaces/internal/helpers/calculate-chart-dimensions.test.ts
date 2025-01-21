import { calculateChartHeight, calculateChartMinWidth } from './calculate-chart-dimensions';
import { defaultConfig } from '../../constants';
import { EBarDirection, EBarGroupingType } from '../../enums';

const config = {
  ...defaultConfig,
};

describe('Calculate chart height', () => {
  // TODO: @dv-usama-ansari: Add more tests for different combinations of the following:
  //  - direction
  //  - useResponsiveBarWidth
  //  - groupType
  //  - containerWidth
  //  - useFullHeight
  //  - containerHeight
  //  - aggregatedData small
  //  - aggregatedData large

  it('should return a number', () => {
    expect(
      Number.isNaN(
        Number(
          calculateChartHeight({
            config,
            containerHeight: 150,
            aggregatedData: { categories: {}, categoriesList: [], groupingsList: [] },
          }),
        ),
      ),
    ).toBe(false);
  });

  it('should return a constant value when not using full height in vertical orientation', () => {
    expect(
      calculateChartHeight({
        config: { ...config, useFullHeight: false, direction: EBarDirection.VERTICAL },
        containerHeight: 150,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(300);
  });

  it('should return a constant value equal to container height minus margins when not using full height', () => {
    expect(
      calculateChartHeight({
        config: { ...config, useFullHeight: true, direction: EBarDirection.VERTICAL },
        containerHeight: 700,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(600);
  });

  it('should return calculated height for horizontal bars', () => {
    expect(
      calculateChartHeight({
        config,
        containerHeight: 150,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(125);
  });

  it('should return calculated height for a lot of horizontal bars', () => {
    expect(
      calculateChartHeight({
        config,
        containerHeight: 150,
        aggregatedData: {
          categoriesList: Array.from({ length: 100 }, (_, i) => `Category ${i + 1}`).concat(['Unknown']),
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(3555);
  });

  it('should return calculated height for stacked bars', () => {
    expect(
      calculateChartHeight({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' } },
        containerHeight: 150,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Group 1', 'Group 2', 'Group 3', 'Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(125);
  });

  it('should return calculated height for grouped bars', () => {
    expect(
      calculateChartHeight({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' }, groupType: EBarGroupingType.GROUP },
        containerHeight: 150,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Group 1', 'Group 2', 'Group 3', 'Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(440);
  });
});

describe('Calculate chart min width', () => {
  it('should return a number', () => {
    expect(
      Number.isNaN(
        Number(
          calculateChartMinWidth({
            config,
            aggregatedData: {
              categories: {},
              categoriesList: [],
              groupingsList: [],
            },
          }),
        ),
      ),
    ).toBe(false);
  });

  it('should return a constant value when not using responsive bar width in vertical orientation', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, useResponsiveBarWidth: false, direction: EBarDirection.VERTICAL },
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(125);
  });

  it('should return a constant value equal to container height minus margins when not using full height', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, useFullHeight: true, direction: EBarDirection.VERTICAL },
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(125);
  });

  it('should return calculated height for horizontal bars', () => {
    expect(
      calculateChartMinWidth({
        config,
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(300);
  });

  it('should return calculated height for a lot of horizontal bars', () => {
    expect(
      calculateChartMinWidth({
        config,
        aggregatedData: {
          categoriesList: Array.from({ length: 100 }, (_, i) => `Category ${i + 1}`).concat(['Unknown']),
          groupingsList: ['Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(300);
  });

  it('should return calculated height for stacked bars', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' } },
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Group 1', 'Group 2', 'Group 3', 'Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(300);
  });

  it('should return calculated height for grouped bars', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' }, groupType: EBarGroupingType.GROUP },
        aggregatedData: {
          categoriesList: ['Category 1', 'Category 2', 'Unknown'],
          groupingsList: ['Group 1', 'Group 2', 'Group 3', 'Unknown'],
          categories: {}, // data not needed for this test
        },
      }),
    ).toBe(300);
  });
});
