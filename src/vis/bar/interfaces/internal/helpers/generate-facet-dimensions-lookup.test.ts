/* eslint-disable @typescript-eslint/dot-notation */
import zipWith from 'lodash/zipWith';

import { createBinLookup } from './create-bin-lookup';
import { generateFacetDimensionsLookup } from './generate-facet-dimensions-lookup';
import { getBarData } from './get-bar-data';
import { getLabelOrUnknown } from '../../../../general/utils';
import { EAggregateTypes, EColumnTypes, VisNumericalValue } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../../stories/fetchBreastCancerData';
import { defaultConfig } from '../../constants';
import { IBarConfig } from '../../interfaces';

async function fetchMockDataTable(config: IBarConfig) {
  const data = await getBarData(fetchBreastCancerData(), config.catColumnSelected!, config.group, config.facets, config.aggregateColumn);
  const binLookup = data.groupColVals?.type === EColumnTypes.NUMERICAL ? createBinLookup(data.groupColVals?.resolvedValues as VisNumericalValue[]) : null;
  return zipWith(
    data.catColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    data.aggregateColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    data.groupColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    data.facetsColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    (cat, agg, group, facet) => {
      return {
        id: cat.id,
        category: getLabelOrUnknown(cat?.val),
        agg: agg?.val as number,
        // if the group column is numerical, use the bin lookup to get the bin name, otherwise use the label or 'unknown'
        group: typeof group?.val === 'number' ? (binLookup?.get(group as VisNumericalValue) as string) : getLabelOrUnknown(group?.val),
        facet: getLabelOrUnknown(facet?.val),
      };
    },
  );
}

const config = { ...defaultConfig };

describe('Generate aggregated data lookup', () => {
  // TODO: @dv-usama-ansari: Add tests for generateFacetDimensionsLookup:
  //  - dataTable: non-faceted data
  //  - dataTable: faceted data
  //  - groupingsList and categoriesList are calculated correctly
  //  - globalMin and globalMax are calculated correctly
  //  - data: sum, count, nums and ids are populated correctly
  //  - **Good to have** check if the function uses multiple threads
  it('should return an instance of object', async () => {
    const lookupParams: Parameters<typeof generateFacetDimensionsLookup>['0'] = {
      ...defaultConfig,
      aggregateType: config.aggregateType,
      display: config.display,
      groupType: config.groupType,
    };
    const dataTable: Parameters<typeof generateFacetDimensionsLookup>['1'] = [];
    const containerHeight: Parameters<typeof generateFacetDimensionsLookup>['2'] = 150;
    const facetDimensionLookup = generateFacetDimensionsLookup(lookupParams, dataTable, containerHeight);
    expect(facetDimensionLookup).toBeInstanceOf(Object);
  });

  describe('Faceted data', () => {
    it('should return the correct aggregate values and global domain for grouped and faceted data', async () => {
      const lookupParams: Parameters<typeof generateFacetDimensionsLookup>['0'] = {
        ...defaultConfig,
        aggregateType: config.aggregateType,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateFacetDimensionsLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.COUNT,
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        facets: { id: 'deathFromCancer', name: 'Death from cancer', description: '' },
      });
      const containerHeight: Parameters<typeof generateFacetDimensionsLookup>['2'] = 150;
      const facetDimensionLookup = generateFacetDimensionsLookup(lookupParams, dataTable, containerHeight);
    });
  });
});
