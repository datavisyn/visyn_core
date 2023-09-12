import { BaseVisConfig, ColumnInfo, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';

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

export enum EHexbinOptions {
  COLOR = 'Color',
  PIE = 'Pie',
  BINS = 'Bins',
}
