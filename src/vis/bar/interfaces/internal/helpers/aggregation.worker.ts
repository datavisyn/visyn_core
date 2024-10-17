import * as ComLink from 'comlink';
import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';

const exposed = { generateAggregatedDataLookup };

export type GenerateAggregatedDataLookup = typeof exposed;

ComLink.expose(exposed);
