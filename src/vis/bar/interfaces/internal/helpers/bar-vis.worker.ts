import * as ComLink from 'comlink';
import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';
import { generateBarSeries } from './generate-bar-series';
import { generateDataTable } from './generate-data-table';
import { getTruncatedTextMap } from './get-truncated-text-map';

const exposed = { generateAggregatedDataLookup, generateBarSeries, generateDataTable, getTruncatedTextMap };

export type GenerateAggregatedDataLookup = typeof exposed;

ComLink.expose(exposed);
