import LineUp, { ColumnBuilder, IValueColumnDesc, Ranking, Taggle } from 'lineupjs';
import castArray from 'lodash/castArray';

export interface ISingleScoreResult {
  data: unknown[];
  builder: ColumnBuilder<IValueColumnDesc<unknown>>;
}

export type IScoreResult = ISingleScoreResult | ISingleScoreResult[];

export async function createScoreColumn(desc: IScoreResult, lineup: LineUp | Taggle, ranking: Ranking): Promise<void> {
  castArray(desc).forEach(({ data, builder }) => {
    const colDesc = builder.build(data.map((d) => ({ [(builder as any).desc.column]: d })));

    colDesc.accessor = (row) => data[row.i];

    const col = lineup.data.create(colDesc);

    ranking.push(col);
  });
}
