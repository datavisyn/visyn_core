import ColumnTable from 'arquero/dist/types/table/column-table';
import { desc } from 'arquero';
import { resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';

export enum SortTypes {
  NONE = 'NONE',
  CAT_ASC = 'CAT_ASC',
  CAT_DESC = 'CAT_DESC',
  COUNT_ASC = 'COUNT_ASC',
  COUNT_DESC = 'COUNT_DESC',
}

export function sortTableBySortType(tempTable: ColumnTable, sortType: SortTypes) {
  switch (sortType) {
    case SortTypes.CAT_ASC:
      return tempTable.orderby('category');
    case SortTypes.CAT_DESC:
      return tempTable.orderby(desc('category'));
    case SortTypes.COUNT_ASC:
      return tempTable.orderby('count');
    case SortTypes.COUNT_DESC:
      return tempTable.orderby(desc('count'));
    default:
      return tempTable;
  }
}

export async function getBarData(
  columns: VisColumn[],
  catColumn: ColumnInfo,
  groupColumn: ColumnInfo | null,
  multiplesColumn: ColumnInfo | null,
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
  };
  multiplesColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const catColVals = await resolveSingleColumn(columns.find((col) => col.info.id === catColumn.id));

  const groupColVals = await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id) : null);
  const multiplesColVals = await resolveSingleColumn(multiplesColumn ? columns.find((col) => col.info.id === multiplesColumn.id) : null);

  return { catColVals, groupColVals, multiplesColVals };
}
