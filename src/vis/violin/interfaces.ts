import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export enum EViolinOverlay {
  NONE = 'None',
  BOX = 'Box',
}

export interface IViolinConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
  violinOverlay: EViolinOverlay;
}

export function isViolinConfig(s: BaseVisConfig): s is IViolinConfig {
  return s.type === ESupportedPlotlyVis.VIOLIN;
}
