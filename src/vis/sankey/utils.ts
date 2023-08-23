import { merge } from 'lodash';
import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis, VisColumn } from '../interfaces';

export interface ISankeyConfig extends BaseVisConfig {
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
