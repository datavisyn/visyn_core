import { BaseVisConfig, ColumnInfo, EAggregateTypes, ESupportedPlotlyVis } from '../interfaces';

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

export interface IBarConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.BAR;
  facets: ColumnInfo | null;
  focusFacetIndex: number | null;
  group: ColumnInfo | null;
  direction: EBarDirection;
  display: EBarDisplayType;
  groupType: EBarGroupingType;
  numColumnsSelected: ColumnInfo[];
  catColumnSelected: ColumnInfo;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
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
};

export function isBarConfig(s: BaseVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}
