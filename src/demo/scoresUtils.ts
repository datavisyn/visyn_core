import { buildCategoricalColumn, buildNumberColumn } from 'lineupjs';
import { IScoreResult } from '../ranking/score/interfaces';
import { buildSMILESColumn } from '../ranking/smiles/SMILESColumnBuilder';

export async function MyStringScore(value: string): Promise<IScoreResult> {
  const data = new Array(5000).fill(0).map(() => (Math.random() * 10).toFixed(0));

  return {
    data,
    builder: buildCategoricalColumn('').label(value),
  };
}

export async function MyNumberScore(value: string): Promise<IScoreResult> {
  const data = new Array(5000).fill(0).map(() => Math.random() * 100);

  return {
    data,
    builder: buildNumberColumn('').label(value),
  };
}

export async function MySMILESScore(value: string): Promise<IScoreResult> {
  const data = new Array(5000).fill(0).map(() => 'C1CCCCC1');

  return {
    data,
    builder: buildSMILESColumn('').label(value),
  };
}
