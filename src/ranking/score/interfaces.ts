import { ColumnBuilder, IValueColumnDesc, IDataRow } from 'lineupjs';

/**
 * A single score result
 */
export type ISingleScoreResult = {
  /**
   * The data to be used for the score column
   */
  data: unknown[];
  /**
   * Metadata for the score, which will be stored in the `desc.scoreMeta` property.
   */
  meta?: object;
} & (
  | {
      /**
       * The lineup builder object to be used for the score column
       */
      builder: ColumnBuilder<IValueColumnDesc<unknown>>;
    }
  | {
      /**
       * The lineup column desc to be used for the score column
       */
      desc: IValueColumnDesc<unknown>;
    }
);

export type IScoreResult = ISingleScoreResult | ISingleScoreResult[];

export interface IScoreColumnDesc<T> extends IValueColumnDesc<T> {
  accessor?(row: IDataRow, desc: Readonly<IScoreColumnDesc<T>>): T;
  scoreData: T[];
  scoreMeta: object;
}
