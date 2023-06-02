import { Taggle } from 'lineupjs';
import castArray from 'lodash/castArray';
import { IScoreColumnDesc, IScoreResult } from './score/interfaces';

export class DatavisynTaggle extends Taggle {
  getRanking() {
    return this.data.getRankings()[0];
  }

  createScoreColumn(desc: IScoreResult) {
    castArray(desc).forEach(({ data, builder }) => {
      const colDesc = builder.build(data.map((d) => ({ [(builder as any).desc.column]: d }))) as IScoreColumnDesc<unknown>;

      // Patch the accessor and add the scoreData directly in the column
      colDesc.accessor = (row, descRef) => descRef.scoreData[row.i];
      colDesc.scoreData = data;

      const col = this.data.create(colDesc);

      this.getRanking().push(col);
    });
  }
}
