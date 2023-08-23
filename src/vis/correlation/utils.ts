import merge from 'lodash/merge';
import { resolveColumnValues } from '../general/layoutUtils';
import {
  BaseVisConfig,
  ColumnInfo,
  EColumnTypes,
  ECorrelationType,
  EScaleType,
  ESupportedPlotlyVis,
  VisCategoricalValue,
  VisColumn,
  VisNumericalValue,
} from '../interfaces';

export interface ICorrelationConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.CORRELATION;
  correlationType: ECorrelationType;
  numColumnsSelected: ColumnInfo[];
  pScaleType: EScaleType;
  pDomain: [number, number];
}

export function isCorrelation(s: BaseVisConfig): s is ICorrelationConfig {
  return s.type === ESupportedPlotlyVis.CORRELATION;
}

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
