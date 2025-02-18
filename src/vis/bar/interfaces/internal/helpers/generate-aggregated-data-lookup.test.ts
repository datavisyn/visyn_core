/* eslint-disable @typescript-eslint/dot-notation */
import zipWith from 'lodash/zipWith';

import { getLabelOrUnknown } from '../../../../general/utils';
import { EAggregateTypes, EColumnTypes, VisNumericalValue } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../../stories/fetchBreastCancerData';
import { defaultConfig } from '../../constants';
import { EBarGroupingType } from '../../enums';
import { IBarConfig } from '../../interfaces';
import { DEFAULT_FACET_NAME } from '../constants';
import { createBinLookup } from './create-bin-lookup';
import { generateAggregatedDataLookup } from './generate-aggregated-data-lookup';
import { getBarData } from './get-bar-data';

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
  // TODO: @dv-usama-ansari: Add tests for generateAggregatedDataLookup:
  //  - dataTable: non-faceted data
  //  - dataTable: faceted data
  //  - groupingsList and categoriesList are calculated correctly
  //  - globalMin and globalMax are calculated correctly
  //  - data: sum, count, nums and ids are populated correctly
  //  - **Good to have** check if the function uses multiple threads
  it('should return an instance of object', async () => {
    const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
      ...defaultConfig,
      aggregateType: config.aggregateType,
      display: config.display,
      groupType: config.groupType,
    };
    const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = [];
    const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
    const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
    const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
    expect(aggregatedDataLookup).toBeInstanceOf(Object);
  });

  it('should return aggregated lookup of breast cancer data', async () => {
    const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
      ...defaultConfig,
      aggregateType: config.aggregateType,
      display: config.display,
      groupType: config.groupType,
    };
    const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
      ...config,
      catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
      aggregateType: EAggregateTypes.COUNT,
    });
    const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
    const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
    const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
    expect(Object.keys(aggregatedDataLookup.facets)[0]).toBe(DEFAULT_FACET_NAME);
    expect(aggregatedDataLookup.facetsList).toEqual([DEFAULT_FACET_NAME]);
    expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
    expect(aggregatedDataLookup.globalDomain.max).toEqual(1010);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.groupingsList).toEqual(['Unknown']);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.total).toEqual(674);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.selected.count).toEqual(0);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.selected.nums).toEqual([]);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.unselected.count).toEqual(674);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.unselected.nums.length).toEqual(674);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.total).toEqual(1010);
    expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.total).toEqual(220);
  });

  describe('Global Domain based on Aggregate Types', () => {
    it('should return the correct aggregate values and global domain for a column with AVERAGE aggregate type', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.AVG,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.AVG,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(28.7782);
    });

    it('should return the correct aggregate values and global domain for a column with MINIMUM aggregate type', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MIN,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MIN,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(0);
    });

    it('should return the correct aggregate values and global domain for a column with MAXIMUM aggregate type', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MAX,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MAX,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(182);
    });

    it('should return the correct aggregate values and global domain for a column with MEDIAN aggregate type', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MED,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MED,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(25);
    });
  });

  describe('Grouped data', () => {
    it('should return the correct aggregate values and global domain for a column with COUNT aggregate type and stacked data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: config.aggregateType,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(1010);
      expect(aggregatedDataLookup.facetsList).toEqual([DEFAULT_FACET_NAME]);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.groupingsList).toEqual(['High', 'Low', 'Moderate', 'Unknown']);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.total).toEqual(674);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['High']?.unselected.count).toEqual(344);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Low']?.unselected.count).toEqual(69);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Moderate']?.unselected.count).toEqual(239);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.unselected.count).toEqual(22);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.total).toEqual(1010);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['High']?.unselected.count).toEqual(484);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Low']?.unselected.count).toEqual(111);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Moderate']?.unselected.count).toEqual(389);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Unknown']?.unselected.count).toEqual(26);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.total).toEqual(220);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['High']?.unselected.count).toEqual(111);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Low']?.unselected.count).toEqual(20);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Moderate']?.unselected.count).toEqual(83);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Unknown']?.unselected.count).toEqual(6);
    });

    it('should return the correct aggregate values and global domain for a column with COUNT aggregate type and grouped data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: config.aggregateType,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        groupType: EBarGroupingType.GROUP,
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(1010);
      expect(aggregatedDataLookup.facetsList).toEqual([DEFAULT_FACET_NAME]);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.groupingsList).toEqual(['High', 'Low', 'Moderate', 'Unknown']);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.total).toEqual(674);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['High']?.unselected.count).toEqual(344);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Low']?.unselected.count).toEqual(69);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Moderate']?.unselected.count).toEqual(239);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['BREAST CONSERVING']?.groups['Unknown']?.unselected.count).toEqual(22);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.total).toEqual(1010);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['High']?.unselected.count).toEqual(484);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Low']?.unselected.count).toEqual(111);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Moderate']?.unselected.count).toEqual(389);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['MASTECTOMY']?.groups['Unknown']?.unselected.count).toEqual(26);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.total).toEqual(220);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['High']?.unselected.count).toEqual(111);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Low']?.unselected.count).toEqual(20);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Moderate']?.unselected.count).toEqual(83);
      expect(aggregatedDataLookup.facets[DEFAULT_FACET_NAME]?.categories['Unknown']?.groups['Unknown']?.unselected.count).toEqual(6);
    });

    it('should return the correct aggregate values and global domain for a column with AVERAGE aggregate type and stacked data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.AVG,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.AVG,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(106.8865);
    });

    it('should return the correct aggregate values and global domain for a column with AVERAGE aggregate type and grouped data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.AVG,
        display: config.display,
        groupType: EBarGroupingType.GROUP,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.AVG,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        groupType: EBarGroupingType.GROUP,
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(30.3023);
    });

    it('should return the correct aggregate values and global domain for a column with MINIMUM aggregate type and stacked data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MIN,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MIN,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(10);
    });

    it('should return the correct aggregate values and global domain for a column with MINIMUM aggregate type and grouped data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MIN,
        display: config.display,
        groupType: EBarGroupingType.GROUP,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MIN,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        groupType: EBarGroupingType.GROUP,
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(9);
    });

    it('should return the correct aggregate values and global domain for a column with MAXIMUM aggregate type and stacked data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MAX,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MAX,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(466);
    });

    it('should return the correct aggregate values and global domain for a column with MAXIMUM aggregate type and grouped data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MAX,
        display: config.display,
        groupType: EBarGroupingType.GROUP,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MAX,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        groupType: EBarGroupingType.GROUP,
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(182);
    });

    it('should return the correct aggregate values and global domain for a column with MEDIAN aggregate type and stacked data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MED,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MED,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(97.5);
    });

    it('should return the correct aggregate values and global domain for a column with MEDIAN aggregate type and grouped data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: EAggregateTypes.MED,
        display: config.display,
        groupType: EBarGroupingType.GROUP,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.MED,
        aggregateColumn: { id: 'tumorSize', name: 'Tumor size', description: '' },
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        groupType: EBarGroupingType.GROUP,
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(25.5);
    });

    it('should return the correct aggregate values and global domain for SAME group and facet columns', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: config.aggregateType,
        display: config.display,
        groupType: EBarGroupingType.GROUP,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.COUNT,
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(484);
      expect(aggregatedDataLookup.facetsList).toEqual(['Unknown']);
      expect(aggregatedDataLookup.facets['Unknown']?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets['Unknown']?.groupingsList).toEqual(['High', 'Low', 'Moderate', 'Unknown']);
    });
  });

  describe('Faceted data', () => {
    it('should return the correct aggregate values and global domain for grouped and faceted data', async () => {
      const lookupParams: Parameters<typeof generateAggregatedDataLookup>['0'] = {
        ...defaultConfig,
        aggregateType: config.aggregateType,
        display: config.display,
        groupType: config.groupType,
      };
      const dataTable: Parameters<typeof generateAggregatedDataLookup>['1'] = await fetchMockDataTable({
        ...config,
        catColumnSelected: { id: 'breastSurgeryType', name: 'Breast surgery type', description: '' },
        aggregateType: EAggregateTypes.COUNT,
        group: { id: 'cellularity', name: 'Cellularity', description: '' },
        facets: { id: 'deathFromCancer', name: 'Death from cancer', description: '' },
      });
      const selectedMap: Parameters<typeof generateAggregatedDataLookup>['2'] = {};
      const containerHeight: Parameters<typeof generateAggregatedDataLookup>['3'] = 150;
      const aggregatedDataLookup = generateAggregatedDataLookup(lookupParams, dataTable, selectedMap, containerHeight);
      expect(aggregatedDataLookup.globalDomain.min).toEqual(0);
      expect(aggregatedDataLookup.globalDomain.max).toEqual(372);
      expect(aggregatedDataLookup.facetsList).toEqual(['Living', 'Died of Disease', 'Died of Other Causes', 'Unknown']);
      expect(aggregatedDataLookup.facets['Living']?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets['Died of Disease']?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets['Died of Other Causes']?.categoriesList).toEqual(['BREAST CONSERVING', 'MASTECTOMY', 'Unknown']);
      expect(aggregatedDataLookup.facets['Unknown']?.categoriesList).toEqual(['BREAST CONSERVING']);
      expect(aggregatedDataLookup.facets['Living']?.groupingsList).toEqual(['High', 'Low', 'Moderate', 'Unknown']);
      expect(aggregatedDataLookup.facets['Unknown']?.groupingsList).toEqual(['Low']);
    });
  });
});
