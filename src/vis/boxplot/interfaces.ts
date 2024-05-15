import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export interface IBoxplotConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
}

export function isBoxplotConfig(s: BaseVisConfig): s is IBoxplotConfig {
  return s.type === ESupportedPlotlyVis.VIOLIN;
}
