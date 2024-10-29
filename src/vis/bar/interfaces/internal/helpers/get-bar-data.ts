import { resolveSingleColumn } from '../../../../general/layoutUtils';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../../../../interfaces';
import { VisColumnWithResolvedValues } from '../../types';

export async function getBarData(
  columns: VisColumn[],
  catColumn: ColumnInfo,
  groupColumn: ColumnInfo | null,
  facetsColumn: ColumnInfo | null,
  aggregateColumn: ColumnInfo | null,
): Promise<{
  catColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  groupColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
    color?: Record<string, string>;
  };
  facetsColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  aggregateColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const catColVals = (await resolveSingleColumn(columns.find((col) => col.info.id === catColumn.id)!)) as VisColumnWithResolvedValues;

  const groupColVals = (await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id)! : null)) as VisColumnWithResolvedValues;
  const facetsColVals = (await resolveSingleColumn(
    facetsColumn ? columns.find((col) => col.info.id === facetsColumn.id)! : null,
  )) as VisColumnWithResolvedValues;
  const aggregateColVals = (await resolveSingleColumn(
    aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id)! : null,
  )) as VisColumnWithResolvedValues;

  return { catColVals, groupColVals, facetsColVals, aggregateColVals };
}
