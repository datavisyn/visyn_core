import { ColumnInfo, EAggregateTypes, ENumericalColorScaleType, ESupportedPlotlyVis } from '../interfaces';

export interface IHeatmapConfig {
  type: ESupportedPlotlyVis.HEATMAP;
  color: ColumnInfo | null;
  catColumnsSelected: ColumnInfo[];
  numColorScaleType: ENumericalColorScaleType;
  sortedBy: ESortTypes;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
}

export enum ESortTypes {
  NONE = 'NONE',
  CAT_ASC = 'CAT_ASC',
  CAT_DESC = 'CAT_DESC',
  COUNT_ASC = 'COUNT_ASC',
  COUNT_DESC = 'COUNT_DESC',
}
