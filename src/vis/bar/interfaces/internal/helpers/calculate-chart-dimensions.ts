import { EBarDirection, EBarGroupingType } from '../../enums';
import { IBarConfig } from '../../interfaces';
import { BAR_SPACING, BAR_WIDTH, CHART_HEIGHT_MARGIN, DEFAULT_BAR_CHART_HEIGHT, DEFAULT_BAR_CHART_MIN_WIDTH } from '../constants';

export function calculateChartMinWidth({
  config,
  categoryCount = 1,
  groupCount = 0,
}: {
  config?: IBarConfig;
  categoryCount: number;
  groupCount: number;
}): number {
  if (config?.direction === EBarDirection.VERTICAL) {
    // calculate height for horizontal bars
    const multiplicationFactor = !config?.group ? 1 : config?.groupType === EBarGroupingType.STACK ? 1 : groupCount;
    const categoryWidth = ((config?.useResponsiveBarWidth ? 1 : BAR_WIDTH) + BAR_SPACING) * multiplicationFactor;
    return categoryCount * categoryWidth + 2 * BAR_SPACING;
  }
  if (config?.direction === EBarDirection.HORIZONTAL) {
    // use fixed height for vertical bars

    return DEFAULT_BAR_CHART_MIN_WIDTH;
  }
  return DEFAULT_BAR_CHART_MIN_WIDTH;
}

export function calculateChartHeight({
  config,
  categoryCount = 1,
  groupCount = 0,
  containerHeight,
}: {
  config?: IBarConfig;
  categoryCount: number;
  groupCount: number;
  containerHeight: number;
}): number {
  if (config?.direction === EBarDirection.HORIZONTAL) {
    // calculate height for horizontal bars
    const multiplicationFactor = !config?.group ? 1 : config?.groupType === EBarGroupingType.STACK ? 1 : groupCount;
    const categoryWidth = (BAR_WIDTH + BAR_SPACING) * multiplicationFactor;
    return categoryCount * categoryWidth + 2 * BAR_SPACING;
  }
  if (config?.direction === EBarDirection.VERTICAL) {
    // use fixed height for vertical bars
    if (!config?.facets && config?.useFullHeight) {
      return containerHeight - CHART_HEIGHT_MARGIN;
    }
    return DEFAULT_BAR_CHART_HEIGHT;
  }
  return DEFAULT_BAR_CHART_HEIGHT;
}
