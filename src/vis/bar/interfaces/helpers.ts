import { BaseVisConfig, ESupportedPlotlyVis } from '../../interfaces';
import { IBarConfig } from './interfaces';

export function isBarConfig(s: BaseVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}
