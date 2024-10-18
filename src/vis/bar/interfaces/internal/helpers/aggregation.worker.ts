import * as ComLink from 'comlink';
import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';
import { generateBarSeries } from './generate-bar-series';

const exposed = { generateAggregatedDataLookup, generateBarSeries };

export type GenerateAggregatedDataLookup = typeof exposed;

ComLink.expose(exposed);
