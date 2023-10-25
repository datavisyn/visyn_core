import { IRankingDump, Ranking, Taggle, DataProvider, LocalDataProvider, TaggleRenderer } from 'lineupjs';
import castArray from 'lodash/castArray';
import { IScoreColumnDesc, IScoreResult } from '../score/interfaces';

export class DatavisynTaggle<T extends DataProvider = LocalDataProvider> extends Taggle {
  /**
   * Quality of life getter that returns the data provider correctly typed
   */
  override get data() {
    return super.data as T;
  }

  /**
   * Quality of life getter that returns the main (first) ranking
   */
  get ranking() {
    return this.data.getFirstRanking();
  }

  /**
   * Clears all rankings and sets the current one
   */
  set ranking(ranking: Ranking) {
    this.data.clearRankings();
    this.data.insertRanking(ranking);
  }

  dumpRanking() {
    return this.ranking.dump(this.data.toDescRef.bind(this.data));
  }

  restoreRanking(dump: IRankingDump) {
    this.ranking = this.data.restoreRanking(dump);
  }

  /**
   * Creates a score column in the supplied ranking. Uses the default ranking if none is supplied.
   *
   * @param desc The score description
   */
  createScoreColumn(desc: IScoreResult, ranking = this.ranking) {
    if (!ranking) {
      throw new Error('No ranking found');
    }

    return castArray(desc).map(({ data, builder }) => {
      const colDesc = builder.build(data.map((d) => ({ [(builder as any).desc.column]: d }))) as IScoreColumnDesc<unknown>;

      // Patch the accessor and add the scoreData directly in the column
      colDesc.accessor = (row, descRef) => descRef.scoreData[row.i];
      colDesc.scoreData = data;

      const col = this.data.create(colDesc);

      return ranking.push(col);
    });
  }

  /**
   * Makes the underlying enableHighlighListening function public.
   */
  override enableHighlightListening(enable: boolean): void {
    super.enableHighlightListening(enable);
  }

  /**
   * Hack that exposes the internal and private renderer.
   */
  get taggleRenderer(): TaggleRenderer {
    // @ts-ignore
    return super.renderer;
  }
}
