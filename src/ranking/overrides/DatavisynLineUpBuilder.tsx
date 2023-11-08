import { DataBuilder } from 'lineupjs';
import { DatavisynTaggle } from './DatavisynTaggle';
import { createFromDescRefWithScoreColumns, createToDescRefWithScoreColumns } from '../score/utilities';

export class DatavisynLineUpBuilder extends DataBuilder {
  buildDatavisynTaggle(node: HTMLElement) {
    return new DatavisynTaggle(node, this.buildDataWithScoreColumnPatch(), this.options);
  }

  buildDataWithScoreColumnPatch() {
    const provider = this.buildData();

    provider.toDescRef = createToDescRefWithScoreColumns(provider.toDescRef.bind(provider));
    provider.fromDescRef = createFromDescRefWithScoreColumns(provider.fromDescRef.bind(provider));

    return provider;
  }
}
