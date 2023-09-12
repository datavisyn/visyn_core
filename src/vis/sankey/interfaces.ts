import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';


export interface ISankeyConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SANKEY;
  catColumnsSelected: ColumnInfo[];
}
