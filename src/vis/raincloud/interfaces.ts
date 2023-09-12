import { ColumnInfo, ECloudType, ELightningType, ERainType, ESupportedPlotlyVis } from '../interfaces';

export interface IRaincloudConfig {
  type: ESupportedPlotlyVis.RAINCLOUD;
  numColumnsSelected: ColumnInfo[];
  cloudType: ECloudType;
  rainType: ERainType;
  lightningType: ELightningType;
  aggregateRain: boolean;
}

export interface IRaindropCircle {
  id: string[];
  x: number;
  y: number;
}
