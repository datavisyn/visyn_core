import * as ComLink from 'comlink';
import type { GenerateAggregatedDataLookup } from './generate-aggregated-data-lookup.worker';

const worker = new Worker(new URL('./generate-aggregated-data-lookup.worker.ts', import.meta.url));
export const GenerateAggregatedDataLookupWorkerWrapper = ComLink.wrap<GenerateAggregatedDataLookup>(worker);
