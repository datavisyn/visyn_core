import { BaseVisConfig, ESupportedPlotlyVis } from '../interfaces';
import { IViolinConfig } from '../violin/interfaces';

export interface IBoxplotConfig extends Omit<IViolinConfig, 'type'> {
  type: ESupportedPlotlyVis.BOXPLOT;
}

export function isBoxplotConfig(s: BaseVisConfig): s is IBoxplotConfig {
  return s.type === ESupportedPlotlyVis.BOXPLOT;
}
