import * as ComLink from 'comlink';
import type { GenerateAggregatedDataLookup } from './aggregation.worker';

const worker = new Worker(new URL('./aggregation.worker.ts', import.meta.url));
export const WorkerWrapper = ComLink.wrap<GenerateAggregatedDataLookup>(worker);
