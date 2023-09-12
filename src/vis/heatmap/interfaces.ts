import { ColumnInfo, EAggregateTypes, ENumericalColorScaleType, ESortTypes, ESupportedPlotlyVis } from '../interfaces';

export interface IHeatmapConfig {
  type: ESupportedPlotlyVis.HEATMAP;
  color: ColumnInfo | null;
  catColumnsSelected: ColumnInfo[];
  numColorScaleType: ENumericalColorScaleType;
  sortedBy: ESortTypes;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
}
