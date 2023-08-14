import { merge } from 'lodash';
import { BaseConfig, ColumnInfo, ESupportedPlotlyVis, VisColumn } from '../interfaces';

export interface ISankeyConfig extends BaseConfig {
  type: ESupportedPlotlyVis.SANKEY;
  catColumnsSelected: ColumnInfo[];
}

const defaultConfig: ISankeyConfig = {
  type: ESupportedPlotlyVis.SANKEY,
  catColumnsSelected: [],
};

export function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig): ISankeyConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}
