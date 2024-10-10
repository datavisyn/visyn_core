import merge from 'lodash/merge';
import { ColumnInfo, EColumnTypes, VisColumn } from '../../interfaces';
import { defaultConfig, IBarConfig } from '../interfaces';

export function barMergeDefaultConfig(columns: VisColumn[], config: IBarConfig): IBarConfig {
  const merged = merge({}, defaultConfig, config);

  const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (!merged.catColumnSelected && catCols.length > 0) {
    merged.catColumnSelected = catCols[catCols.length - 1]?.info as ColumnInfo;
  }

  if (!merged.aggregateColumn && numCols.length > 0) {
    merged.aggregateColumn = numCols[numCols.length - 1]?.info as ColumnInfo;
  }

  return merged;
}
