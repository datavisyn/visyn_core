import LineUp, { ColumnBuilder, IValueColumnDesc, Ranking, Taggle } from 'lineupjs';
import castArray from 'lodash/castArray';

/**
 * A single score result
 * data: the data to be used for the score column
 * builder: the builder to be used for the score column
 */
export interface ISingleScoreResult {
  data: unknown[];
  builder: ColumnBuilder<IValueColumnDesc<unknown>>;
}

export type IScoreResult = ISingleScoreResult | ISingleScoreResult[];

/**
 * Creates a score column
 * @param desc the description of the score column
 * @param lineup the lineup instance
 * @param ranking the ranking to which the score column should be added
 */
export async function createScoreColumn(desc: IScoreResult, lineup: LineUp | Taggle, ranking: Ranking): Promise<void> {
  castArray(desc).forEach(({ data, builder }) => {
    const colDesc = builder.build(data.map((d) => ({ [(builder as any).desc.column]: d })));

    colDesc.accessor = (row) => data[row.i];

    const col = lineup.data.create(colDesc);

    ranking.push(col);
  });
}
