import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';

export async function getScatterData(
  columns: VisColumn[],
  numericalColumnDescs: ColumnInfo[],
  colorColumnDesc: ColumnInfo,
): Promise<{
  numericalColumns: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
  colorColumn: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const numericalColumns = await resolveColumnValues(columns.filter((col) => numericalColumnDescs.find((numCol) => numCol.id === col.info.id)));
  const colorColumn = await resolveSingleColumn(columns.find((col) => col.info.id === colorColumnDesc.id));

  return { numericalColumns, colorColumn };
}
