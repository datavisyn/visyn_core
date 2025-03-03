import * as ComLink from 'comlink';

import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';
import { generateBarSeries } from './generate-bar-series';
import { generateDataTable } from './generate-data-table';
import { generateFacetDimensionsLookup } from './generate-facet-dimensions-lookup';

const exposed = { generateAggregatedDataLookup, generateFacetDimensionsLookup, generateBarSeries, generateDataTable };

export type GenerateAggregatedDataLookup = typeof exposed;

ComLink.expose(exposed);
