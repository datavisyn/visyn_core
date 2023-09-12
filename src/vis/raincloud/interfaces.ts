import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

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

export enum ERainType {
  DOTPLOT = 'Dot plot',
  BEESWARM = 'Beeswarm',
  WHEATPLOT = 'Wheat plot',
  STRIPPLOT = 'Strip plot',
}

export enum ECloudType {
  SPLIT_VIOLIN = 'Split violin',
  HEATMAP = 'Heatmap',
  HISTOGRAM = 'Histogram',
}

export enum ELightningType {
  MEAN_AND_DEV = 'Mean and deviation',
  MEDIAN_AND_DEV = 'Median and deviation',
  MEAN = 'Mean',
  BOXPLOT = 'Boxplot',
}

export function isRaincloudConfig(s: BaseVisConfig): s is IRaincloudConfig {
  return s.type === ESupportedPlotlyVis.RAINCLOUD;
}
