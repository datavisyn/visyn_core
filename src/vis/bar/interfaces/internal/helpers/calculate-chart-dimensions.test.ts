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
            categoryCount: 1,
            groupCount: 0,
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
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(300);
  });

  it('should return a constant value equal to container height minus margins when not using full height', () => {
    expect(
      calculateChartHeight({
        config: { ...config, useFullHeight: true, direction: EBarDirection.VERTICAL },
        containerHeight: 700,
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(600);
  });

  it('should return calculated height for horizontal bars', () => {
    expect(
      calculateChartHeight({
        config,
        containerHeight: 150,
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(125);
  });

  it('should return calculated height for a lot of horizontal bars', () => {
    expect(
      calculateChartHeight({
        config,
        containerHeight: 150,
        categoryCount: 100,
        groupCount: 1,
      }),
    ).toBe(3520);
  });

  it('should return calculated height for stacked bars', () => {
    expect(
      calculateChartHeight({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' } },
        containerHeight: 150,
        categoryCount: 3,
        groupCount: 4,
      }),
    ).toBe(125);
  });

  it('should return calculated height for grouped bars', () => {
    expect(
      calculateChartHeight({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' }, groupType: EBarGroupingType.GROUP },
        containerHeight: 150,
        categoryCount: 3,
        groupCount: 4,
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
            categoryCount: 1,
            groupCount: 0,
          }),
        ),
      ),
    ).toBe(false);
  });

  it('should return a constant value when not using responsive bar width in vertical orientation', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, useResponsiveBarWidth: false, direction: EBarDirection.VERTICAL },
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(125);
  });

  it('should return a constant value equal to container height minus margins when not using full height', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, useFullHeight: true, direction: EBarDirection.VERTICAL },
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(125);
  });

  it('should return calculated height for horizontal bars', () => {
    expect(
      calculateChartMinWidth({
        config,
        categoryCount: 3,
        groupCount: 1,
      }),
    ).toBe(300);
  });

  it('should return calculated height for a lot of horizontal bars', () => {
    expect(
      calculateChartMinWidth({
        config,
        categoryCount: 100,
        groupCount: 1,
      }),
    ).toBe(300);
  });

  it('should return calculated height for stacked bars', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' } },
        categoryCount: 3,
        groupCount: 4,
      }),
    ).toBe(300);
  });

  it('should return calculated height for grouped bars', () => {
    expect(
      calculateChartMinWidth({
        config: { ...config, group: { id: 'group', name: 'Group column', description: '' }, groupType: EBarGroupingType.GROUP },
        categoryCount: 3,
        groupCount: 4,
      }),
    ).toBe(300);
  });
});
