import merge from 'lodash/merge';
import {
  ColumnInfo,
  EColumnTypes,
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
  numColumnsSelected: [],
  highlightSignificant: false,
};

export function correlationMergeDefaultConfig(columns: VisColumn[], config: ICorrelationConfig): IVisConfig {
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