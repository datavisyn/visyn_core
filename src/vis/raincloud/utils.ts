import { merge } from 'lodash';
import { resolveColumnValues } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, ESupportedPlotlyVis, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { ECloudType, ELightningType, ERainType, IRaincloudConfig } from './interfaces';

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
