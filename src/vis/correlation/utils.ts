import merge from 'lodash/merge';
import { ESupportedPlotlyVis, ICorrelationConfig, IVisConfig, VisColumn } from '../interfaces';

export function isCorrelation(s: IVisConfig): s is ICorrelationConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}

const defaultConfig: ICorrelationConfig = {
  type: ESupportedPlotlyVis.CORRELATION,
  numColumnsSelected: [],
};

export function correlationMergeDefaultConfig(columns: VisColumn[], config: ICorrelationConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  return merged;
}
