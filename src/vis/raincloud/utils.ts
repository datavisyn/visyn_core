import { merge } from 'lodash';
import { resolveColumnValues } from '../general/layoutUtils';
import {
  BaseConfig,
  ColumnInfo,
  ECloudType,
  EColumnTypes,
  ELightningType,
  ERainType,
  ESupportedPlotlyVis,
  VisCategoricalValue,
  VisColumn,
  VisNumericalValue,
} from '../interfaces';

export interface IRaincloudConfig {
  type: ESupportedPlotlyVis.RAINCLOUD;
  numColumnsSelected: ColumnInfo[];
  cloudType: ECloudType;
  rainType: ERainType;
  lightningType: ELightningType;
  aggregateRain: boolean;
}

export function isRaincloud(s: BaseConfig): s is IRaincloudConfig {
  return s.type === ESupportedPlotlyVis.RAINCLOUD;
}

const defaultConfig: IRaincloudConfig = {
  type: ESupportedPlotlyVis.RAINCLOUD,
  numColumnsSelected: [],
  cloudType: ECloudType.SPLIT_VIOLIN,
  rainType: ERainType.DOTPLOT,
  lightningType: ELightningType.BOXPLOT,
  aggregateRain: false,
};

export function raincloudMergeDefaultConfig(columns: VisColumn[], config: IRaincloudConfig): IRaincloudConfig {
  const merged = merge({}, defaultConfig, config);

  return merged;
}

export async function getRaincloudData(
  columns: VisColumn[],
  numColumnsSelected: ColumnInfo[],
): Promise<{
  numColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
}> {
  const numColVals = await resolveColumnValues(columns.filter((col) => numColumnsSelected.find((numCol: ColumnInfo) => numCol.id === col.info.id)));

  return { numColVals };
}

export interface IRaindropCircle {
  id: string[];
  x: number;
  y: number;
}
