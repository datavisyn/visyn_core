import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export interface ISankeyConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SANKEY;
  catColumnsSelected: ColumnInfo[];
}

export function isSankeyConfig(s: BaseVisConfig): s is ISankeyConfig {
  return s.type === ESupportedPlotlyVis.SANKEY;
}
