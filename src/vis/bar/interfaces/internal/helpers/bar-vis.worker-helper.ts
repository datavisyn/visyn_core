import * as ComLink from 'comlink';
import type { GenerateAggregatedDataLookup } from './bar-vis.worker';

const worker = new Worker(new URL('./bar-vis.worker.ts', import.meta.url));
export const WorkerWrapper = ComLink.wrap<GenerateAggregatedDataLookup>(worker);
