import * as ComLink from 'comlink';

import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';
import { generateBarSeries } from './generate-bar-series';
import { generateDataTable } from './generate-data-table';

const exposed = { generateAggregatedDataLookup, generateBarSeries, generateDataTable };

export type GenerateAggregatedDataLookup = typeof exposed;

ComLink.expose(exposed);
