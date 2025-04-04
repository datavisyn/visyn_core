import { randomSurnames } from './randomSurnames';
import { IScoreResult } from '../ranking/score/interfaces';
import { buildSMILESColumn } from '../ranking/smiles/SMILESColumnBuilder';

export async function MyCategoricalScore(value: string): Promise<IScoreResult> {
  const { buildCategoricalColumn } = await import('lineupjs');
  const data = new Array(5000).fill(0).map(() => (Math.random() * 10).toFixed(0));

  return {
    data,
    builder: buildCategoricalColumn('').label(value),
  };
}

export async function MyNumberScore(value: string): Promise<IScoreResult> {
  const { buildNumberColumn } = await import('lineupjs');
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

export async function MyStringScore(value: string): Promise<IScoreResult> {
  const { buildStringColumn } = await import('lineupjs');
  const data = new Array(5000).fill(0).map(() => randomSurnames[Math.floor(Math.random() * randomSurnames.length)]);

  return {
    data,
    builder: buildStringColumn('').label(value),
  };
}

export async function MyLinkScore(value: string): Promise<IScoreResult> {
  const { buildStringColumn } = await import('lineupjs');
  const data = new Array(5000).fill(0).map(() => randomSurnames[Math.floor(Math.random() * randomSurnames.length)]);

  return {
    data,
    builder: buildStringColumn('').label(value).pattern(`https://duckduckgo.com/?q=\${value}`),
  };
}
