import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export interface ILineConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.LINE;
  xAxisColumn: ColumnInfo | null;
  numColumnsSelected: ColumnInfo[];
}

export function isLineConfig(s: BaseVisConfig): s is ILineConfig {
  return s.type === ESupportedPlotlyVis.LINE;
}
