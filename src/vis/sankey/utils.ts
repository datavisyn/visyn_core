import { merge } from 'lodash';
import { ESupportedPlotlyVis, ISankeyConfig, VisColumn } from '../interfaces';

const defaultConfig: ISankeyConfig = {
  type: ESupportedPlotlyVis.SANKEY,
  catColumnsSelected: [],
};

export function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig): ISankeyConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}
