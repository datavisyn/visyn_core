import { BaseVisConfig, ColumnInfo, EAggregateTypes, ENumericalColorScaleType, ESupportedPlotlyVis } from '../interfaces';

export interface IHeatmapConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.HEATMAP;
  color: ColumnInfo | null;
  catColumnsSelected: ColumnInfo[];
  numColorScaleType: ENumericalColorScaleType;
  xSortedBy: ESortTypes;
  ySortedBy: ESortTypes;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
  isAnimationEnabled: boolean;
}

export enum ESortTypes {
  CAT_ASC = 'CAT_ASC',
  CAT_DESC = 'CAT_DESC',
  VAL_ASC = 'VAL_ASC',
  VAL_DESC = 'VAL_DESC',
  NONE = 'NONE',
}

export function isHeatmapConfig(vis: BaseVisConfig): vis is IHeatmapConfig {
  return vis.type === ESupportedPlotlyVis.HEATMAP;
}
