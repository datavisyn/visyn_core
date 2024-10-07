import type { BaseVisConfig, ColumnInfo, EAggregateTypes, ESupportedPlotlyVis } from '../../interfaces';
import type { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState } from './enums';

export interface IBarConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.BAR;
  facets: ColumnInfo | null;
  focusFacetIndex?: number | null;
  group: ColumnInfo | null;
  direction: EBarDirection;
  display: EBarDisplayType;
  groupType: EBarGroupingType;
  numColumnsSelected: ColumnInfo[];
  catColumnSelected: ColumnInfo | null;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
  showFocusFacetSelector?: boolean;
  sortState?: { x: EBarSortState; y: EBarSortState };
  useFullHeight?: boolean;
  useResponsiveBarWidth?: boolean;
}

/**
 * Interface for the data table used in the bar chart.
 * @internal
 */
export interface IBarDataTableRow {
  id: string;
  category: string;
  agg: number;
  group: string;
  facet: string;
}
