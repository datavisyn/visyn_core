import { BaseVisConfig, ColumnInfo, EAggregateTypes, ESupportedPlotlyVis, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';

export enum SortTypes {
  NONE = 'NONE',
  CAT_ASC = 'CAT_ASC',
  CAT_DESC = 'CAT_DESC',
  COUNT_ASC = 'COUNT_ASC',
  COUNT_DESC = 'COUNT_DESC',
}

export enum EBarGroupingType {
  STACK = 'Stacked',
  GROUP = 'Grouped',
}

export enum EBarDisplayType {
  ABSOLUTE = 'Absolute',
  NORMALIZED = 'Normalized',
}
export enum EBarDirection {
  VERTICAL = 'Vertical',
  HORIZONTAL = 'Horizontal',
}

export enum EBarSortState {
  NONE = 'None',
  ASCENDING = 'Ascending',
  DESCENDING = 'Descending',
}

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
}

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
};

export function isBarConfig(s: BaseVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
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

export type VisColumnWithResolvedValues = VisColumn & { resolvedValues: (VisNumericalValue | VisCategoricalValue)[] };
