import merge from 'lodash/merge';
import { resolveColumnValues } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, EScaleType, ESupportedPlotlyVis, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { ECorrelationType, ICorrelationConfig } from './interfaces';

const defaultConfig: ICorrelationConfig = {
  type: ESupportedPlotlyVis.CORRELATION,
  correlationType: ECorrelationType.PEARSON,
  numColumnsSelected: [],
  pScaleType: EScaleType.LOG,
  pDomain: [0.5, 0.01],
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
