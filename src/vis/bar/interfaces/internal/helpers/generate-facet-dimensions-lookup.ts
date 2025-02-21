import groupBy from 'lodash/groupBy';
import sort from 'lodash/sortBy';
import sortedUniq from 'lodash/sortedUniq';

import { NAN_REPLACEMENT } from '../../../../general/constants';
import { IBarConfig, IBarDataTableRow } from '../../interfaces';
import { DEFAULT_FACET_NAME } from '../constants';
import { calculateChartHeight, calculateChartMinWidth } from './calculate-chart-dimensions';

export function generateFacetDimensionsLookup(config: IBarConfig, dataTable: IBarDataTableRow[], containerHeight: number) {
  const facetGrouped = config.facets?.id ? groupBy(dataTable, 'facet') : { [DEFAULT_FACET_NAME]: dataTable };
  const dimensions: { facets: { [facet: string]: { height: number; minWidth: number } }; facetsList: string[] } = {
    facets: {},
    facetsList: Object.keys(facetGrouped),
  };

  Object.keys(facetGrouped).forEach((facet) => {
    const facetSensitiveDataTable = facet === DEFAULT_FACET_NAME ? dataTable : dataTable.filter((item) => item.facet === facet);
    const categoriesList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.category) ?? []));
    const groupingsList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.group ?? NAN_REPLACEMENT) ?? []));
    const facetHeight = calculateChartHeight({
      config,
      containerHeight,
      categoryCount: categoriesList.length,
      groupCount: groupingsList.length,
    });
    const facetMinWidth = calculateChartMinWidth({
      config,
      categoryCount: categoriesList.length,
      groupCount: groupingsList.length,
    });
    if (!dimensions.facets[facet]) {
      dimensions.facets[facet] = { height: facetHeight, minWidth: facetMinWidth };
    }
  });

  return dimensions;
}
