import { EAggregateTypes, ESupportedPlotlyVis } from '../../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState } from './enums';
import { IBarConfig } from './interfaces';

/**
 * Default configuration for the bar plot.
 */
export const defaultConfig: IBarConfig = {
  type: ESupportedPlotlyVis.BAR,
  numColumnsSelected: [],
  catColumnSelected: null,
  group: null,
  groupType: EBarGroupingType.STACK,
  facets: null,
  focusFacetIndex: null,
  display: EBarDisplayType.ABSOLUTE,
  direction: EBarDirection.HORIZONTAL,
  aggregateColumn: null,
  aggregateType: EAggregateTypes.COUNT,
  showFocusFacetSelector: false,
  sortState: { x: EBarSortState.NONE, y: EBarSortState.NONE },
  useFullHeight: true,
  useResponsiveBarWidth: false,
};
