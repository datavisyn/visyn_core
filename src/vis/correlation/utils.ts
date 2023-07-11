import merge from 'lodash/merge';
import {
  ColumnInfo,
  EColumnTypes,
  ECorrelationPlotMode,
  ECorrelationType,
  EScaleType,
  ESupportedPlotlyVis,
  ICorrelationConfig,
  IVisConfig,
  VisCategoricalValue,
  VisColumn,
  VisNumericalValue,
} from '../interfaces';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';

export function isCorrelation(s: IVisConfig): s is ICorrelationConfig {
  return s.type === ESupportedPlotlyVis.CORRELATION;
}

const defaultConfig: ICorrelationConfig = {
  type: ESupportedPlotlyVis.CORRELATION,
  correlationType: ECorrelationType.PEARSON,
  numColumnsSelected: [],
  pScaleType: EScaleType.LINEAR,
};

export function correlationMergeDefaultConfig(columns: VisColumn[], config: ICorrelationConfig): ICorrelationConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

export async function getCorrelationMatrixData(
  columns: VisColumn[],
  numericalColumnDescs: ColumnInfo[],
): Promise<{
  numericalColumns: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
}> {
  const numericalColumns = await resolveColumnValues(columns.filter((col) => numericalColumnDescs.find((numCol) => numCol.id === col.info.id)));

  return { numericalColumns };
}