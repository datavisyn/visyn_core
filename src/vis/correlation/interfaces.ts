import { BaseVisConfig, ColumnInfo, EScaleType, ESupportedPlotlyVis } from '../interfaces';

export interface ICorrelationConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.CORRELATION;
  correlationType: ECorrelationType;
  numColumnsSelected: ColumnInfo[];
  pScaleType: EScaleType;
  pDomain: [number, number];
}

export enum ECorrelationType {
  PEARSON = 'Pearson',
  SPEARMAN = 'Spearman',
}
