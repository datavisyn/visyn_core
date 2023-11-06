import { ColumnBuilder, IValueColumnDesc, IDataRow } from 'lineupjs';

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
