import { merge } from 'lodash';
import { ESupportedPlotlyVis, VisColumn } from '../interfaces';
import { ILineConfig } from './interfaces';

const defaultConfig: ILineConfig = {
  type: ESupportedPlotlyVis.LINE,
  numColumnsSelected: [],
  xAxisColumn: null,
};

export function lineMergeDefaultConfig(columns: VisColumn[], config: ILineConfig): ILineConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}
