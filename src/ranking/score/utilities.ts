import { IColumnDesc, IValueColumnDesc } from 'lineupjs';
import { IScoreColumnDesc } from './interfaces';

export function isScoreColumnDesc<T = unknown>(desc: IValueColumnDesc<T> | IColumnDesc): desc is IScoreColumnDesc<T> {
  return !!(desc as any)?.scoreData;
}

/**
 * Creates an implementation of toDescRef that supports score columns.
 * Note: This is only useful for the ranking dump function. The data provider from the ranking already
 * uses this internally.
 *
 * @param defaultToDescRef the default behavior that gets called for each column that is NOT a score column
 * @returns a function that can be directly passed to the dump function of the ranking
 */
export function createToDescRefWithScoreColumns(defaultToDescRef: (value) => any) {
  return (desc) => {
    if (isScoreColumnDesc(desc)) {
      // Score column
      delete desc.accessor;
      return desc;
    }

    return defaultToDescRef(desc);
  };
}

/**
 * Creates an implementation of fromDescRef that supports score columns.
 * Note: This is only useful for the ranking dump function. The data provider from the ranking already
 * uses this internally.
 *
 * @param defaultFromDescRef the default behavior that gets called for each column that is NOT a score column
 * @returns a function that can be directly passed to the restore function of the ranking
 */
export function createFromDescRefWithScoreColumns(defaultFromDescRef: (value) => any) {
  return (descRef) => {
    const newDesc = defaultFromDescRef(descRef);

    if (isScoreColumnDesc(newDesc)) {
      // Score column
      newDesc.accessor = (row, desc) => desc.scoreData[row.i];
    }

    return newDesc;
  };
}
