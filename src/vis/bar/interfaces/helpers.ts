import { IBarConfig } from './interfaces';
import { BaseVisConfig, ESupportedPlotlyVis } from '../../interfaces';

/**
 * Check if the config is a bar config.
 * @param s vis config
 * @returns `true` if the config is a bar config, `false` otherwise
 */
export function isBarConfig(s: BaseVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}
