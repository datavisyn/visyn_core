import LineUp, { ColumnBuilder, IValueColumnDesc, Ranking, Taggle, Column, IColumnDesc, IDataRow } from 'lineupjs';
import castArray from 'lodash/castArray';

/**
 * A single score result
 */
export interface ISingleScoreResult {
  /**
   * The data to be used for the score column
   */
  data: unknown[];
  /**
   * The lineup builder object to be used for the score column
   */
  builder: ColumnBuilder<IValueColumnDesc<unknown>>;
}

export type IScoreResult = ISingleScoreResult | ISingleScoreResult[];

export interface IScoreColumnDesc<T> extends IValueColumnDesc<T> {
  accessor?(row: IDataRow, desc: Readonly<IScoreColumnDesc<T>>): T;
  scoreData: T[];
}

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

/**
 * Creates a score column
 * @param desc the description of the score column
 * @param lineup the lineup instance
 * @param ranking the ranking to which the score column should be added
 */
export async function createScoreColumn(desc: IScoreResult, lineup: LineUp | Taggle, ranking: Ranking): Promise<void> {
  castArray(desc).forEach(({ data, builder }) => {
    const colDesc = builder.build(data.map((d) => ({ [(builder as any).desc.column]: d }))) as IScoreColumnDesc<unknown>;

    // Patch the accessor and add the scoreData directly in the column
    colDesc.accessor = (row, descRef) => descRef.scoreData[row.i];
    colDesc.scoreData = data;

    const col = lineup.data.create(colDesc);

    ranking.push(col);
  });
}
