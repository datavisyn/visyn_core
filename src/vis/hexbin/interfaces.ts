import { BaseVisConfig, ColumnInfo, EHexbinOptions, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';

export interface IHexbinConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.HEXBIN;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  hexRadius: number;
  isOpacityScale: boolean;
  isSizeScale: boolean;
  dragMode: EScatterSelectSettings;
  hexbinOptions: EHexbinOptions;
}
