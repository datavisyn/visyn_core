import { merge } from 'lodash';
import {
  ColumnInfo,
  ECloudType,
  EColumnTypes,
  ESupportedPlotlyVis,
  IRaincloudConfig,
  IVisConfig,
  VisCategoricalValue,
  VisColumn,
  VisNumericalColumn,
  VisNumericalValue,
} from '../interfaces';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';

export function isRaincloud(s: IVisConfig): s is IRaincloudConfig {
  return s.type === ESupportedPlotlyVis.RAINCLOUD;
}

const defaultConfig: IRaincloudConfig = {
  type: ESupportedPlotlyVis.RAINCLOUD,
  numColumnsSelected: [],
  cloudType: ECloudType.SPLIT_VIOLIN,
};

export function raincloudMergeDefaultConfig(columns: VisColumn[], config: IRaincloudConfig): IVisConfig {
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
