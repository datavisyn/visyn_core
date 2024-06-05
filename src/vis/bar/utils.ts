import { bin, desc, op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import merge from 'lodash/merge';
import { resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { IBarConfig, SortTypes, defaultConfig } from './interfaces';

export function barMergeDefaultConfig(columns: VisColumn[], config: IBarConfig): IBarConfig {
  const merged = merge({}, defaultConfig, config);

  const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (!merged.catColumnSelected && catCols.length > 0) {
    merged.catColumnSelected = catCols[catCols.length - 1].info;
  }

  if (!merged.aggregateColumn && numCols.length > 0) {
    merged.aggregateColumn = numCols[numCols.length - 1].info;
  }

  return merged;
}

// Helper function for the bar chart which sorts the data depending on the sort type.
export function sortTableBySortType(tempTable: ColumnTable, sortType: SortTypes) {
  switch (sortType) {
    case SortTypes.CAT_ASC:
      return tempTable.orderby(desc('category'));
    case SortTypes.CAT_DESC:
      return tempTable.orderby('category');
    case SortTypes.COUNT_ASC:
      return tempTable.orderby('count');
    case SortTypes.COUNT_DESC:
      return tempTable.orderby(desc('count'));
    case SortTypes.ID_ASC:
      return tempTable.orderby('id');
    case SortTypes.ID_DESC:
      return tempTable.orderby(desc('id'));
    case SortTypes.NUM_ASC:
      return tempTable.orderby('numerical');
    case SortTypes.NUM_DESC:
      return tempTable.orderby(desc('numerical'));
    default:
      return tempTable;
  }
}

// Helper function for the bar chart which bins the data depending on the aggregate type. Used for numerical column grouping
export function binByAggregateType(tempTable: ColumnTable, aggregateType: EAggregateTypes) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
      return tempTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ aggregateVal: () => op.count(), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.AVG:
      return tempTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({
          aggregateVal: (d) => op.average(d.aggregateVal),
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.MIN:
      return tempTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ aggregateVal: (d) => op.min(d.aggregateVal), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.MED:
      return tempTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({
          aggregateVal: (d) => op.median(d.aggregateVal),
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });

    case EAggregateTypes.MAX:
      return tempTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ aggregateVal: (d) => op.max(d.aggregateVal), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    default:
      return null;
  }
}

// Helper function for the bar chart which aggregates the data based on the aggregate type.
// Mostly just code duplication with the different aggregate types.
export function groupByAggregateType(tempTable: ColumnTable, aggregateType: EAggregateTypes) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
      return tempTable
        .groupby('category', 'group')
        .rollup({ aggregateVal: () => op.count(), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.AVG:
      return tempTable
        .groupby('category', 'group')
        .rollup({
          aggregateVal: (d) => op.average(d.aggregateVal),
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.MIN:
      return tempTable
        .groupby('category', 'group')
        .rollup({ aggregateVal: (d) => op.min(d.aggregateVal), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.MED:
      return tempTable
        .groupby('category', 'group')
        .rollup({
          aggregateVal: (d) => op.median(d.aggregateVal),
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });

    case EAggregateTypes.MAX:
      return tempTable
        .groupby('category', 'group')
        .rollup({ aggregateVal: (d) => op.max(d.aggregateVal), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    default:
      return null;
  }
}

// Helper function for the bar chart which rolls up the data depending on the aggregate type.
// Mostly just code duplication with the different aggregate types.
export function rollupByAggregateType(tempTable: ColumnTable, aggregateType: EAggregateTypes) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
      return tempTable.rollup({ aggregateVal: () => op.count() });
    case EAggregateTypes.AVG:
      return tempTable.rollup({ aggregateVal: (d) => op.average(d.aggregateVal) });
    case EAggregateTypes.MIN:
      return tempTable.rollup({ aggregateVal: (d) => op.min(d.aggregateVal) });
    case EAggregateTypes.MED:
      return tempTable.rollup({ aggregateVal: (d) => op.median(d.aggregateVal) });
    case EAggregateTypes.MAX:
      return tempTable.rollup({ aggregateVal: (d) => op.max(d.aggregateVal) });

    default:
      return null;
  }
}

export async function getBarData({
  aggregateColumn,
  catColumn,
  numColumn,
  columns,
  facetsColumn,
  groupColumn,
}: {
  columns: VisColumn[];
  catColumn: ColumnInfo;
  numColumn: ColumnInfo;
  groupColumn: ColumnInfo | null;
  facetsColumn: ColumnInfo | null;
  aggregateColumn: ColumnInfo | null;
}): Promise<{
  catColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  numColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  groupColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
    color?: Record<string, string>;
  };
  facetsColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  aggregateColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const catColVals = await resolveSingleColumn(columns.find((col) => col.info.id === catColumn?.id));
  const numColVals = await resolveSingleColumn(columns.find((col) => col.info.id === numColumn?.id));

  const groupColVals = await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id) : null);
  const facetsColVals = await resolveSingleColumn(facetsColumn ? columns.find((col) => col.info.id === facetsColumn.id) : null);
  const aggregateColVals = await resolveSingleColumn(aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id) : null);

  return { catColVals, numColVals, groupColVals, facetsColVals, aggregateColVals };
}

export async function experimentalGetBarData({ columns, config }: { columns: VisColumn[]; config: IBarConfig }) {
  const awaitedColumnValues = config.catColumnSelected
    ? await resolveSingleColumn(columns.find((col) => col.info.id === config.catColumnSelected.id))
    : config.numColumnSelected
      ? await resolveSingleColumn(columns.find((col) => col.info.id === config.numColumnSelected.id))
      : null;

  const awaitedGroupColumnValues = await resolveSingleColumn(columns.find((col) => col.info.id === config.group?.id));
  const awaitedFacetsColumnValues = await resolveSingleColumn(columns.find((col) => col.info.id === config.facets?.id));
  const awaitedAggregateColumnValues = await resolveSingleColumn(columns.find((col) => col.info.id === config.aggregateColumn?.id));
  return { awaitedColumnValues, awaitedGroupColumnValues, awaitedFacetsColumnValues, awaitedAggregateColumnValues } as const;
}

// Helper function for the bar chart which sorts the data depending on the sort type.
export function experimentalSortBySortType(aggregatedData: ReturnType<typeof experimentalGroupByAggregateType> | undefined, sortType: SortTypes) {
  switch (sortType) {
    case SortTypes.CAT_ASC:
      return aggregatedData?.sort((a, b) => (a.category as string).localeCompare(b.category as string));
    case SortTypes.CAT_DESC:
      return aggregatedData?.sort((a, b) => (b.category as string).localeCompare(a.category as string));
    case SortTypes.COUNT_ASC:
      return aggregatedData?.sort((a, b) => (a.aggregatedValue as number) - (b.aggregatedValue as number));
    case SortTypes.COUNT_DESC:
      return aggregatedData?.sort((a, b) => (b.aggregatedValue as number) - (a.aggregatedValue as number));
    case SortTypes.ID_ASC:
      return aggregatedData?.sort((a, b) => {
        if (!Number.isNaN(`${a.aggregatedValue}`) && !Number.isNaN(`${b.aggregatedValue}`))
          return (a.aggregatedValue as number) - (b.aggregatedValue as number);
        return (a.category as string).localeCompare(b.category as string);
      });
    case SortTypes.ID_DESC:
      return aggregatedData?.sort((a, b) => {
        if (!Number.isNaN(`${a.aggregatedValue}`) && !Number.isNaN(`${b.aggregatedValue}`))
          return (b.aggregatedValue as number) - (a.aggregatedValue as number);
        return (a.category as string).localeCompare(b.category as string);
      });
    case SortTypes.NUM_ASC:
      return aggregatedData?.sort((a, b) => {
        if (!Number.isNaN(`${a.aggregatedValue}`) && !Number.isNaN(`${b.aggregatedValue}`))
          return (a.aggregatedValue as number) - (b.aggregatedValue as number);
        return (a.category as string).localeCompare(b.category as string);
      });
    case SortTypes.NUM_DESC:
      return aggregatedData?.sort((a, b) => {
        if (!Number.isNaN(`${a.aggregatedValue}`) && !Number.isNaN(`${b.aggregatedValue}`))
          return (b.aggregatedValue as number) - (a.aggregatedValue as number);
        return (a.category as string).localeCompare(b.category as string);
      });
    default:
      return aggregatedData;
  }
}

function experimentalSimpleNumericalAggregation({
  experimentalBarDataColumns,
  selectedMap,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
}) {
  const resolvedValuesMap = new Map<string, string | number>(
    experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((item) => [item.id, item.val]) ?? [],
  );
  const selectedIdsMap = new Map<string, boolean>(
    experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((val) => [val.id, Boolean(selectedMap?.[val?.id])] as const) ?? [],
  );
  const mergedData =
    experimentalBarDataColumns?.awaitedAggregateColumnValues?.resolvedValues.map((v) => {
      const matchingValue = resolvedValuesMap.get(v.id);
      const selectedFlag = selectedIdsMap.get(v.id);
      return { id: v.id, value: v.val, category: matchingValue, selected: selectedFlag };
    }) ?? [];

  return mergedData;
}

function experimentalNumericalAggregationBasedOnAggregationType(
  aggregateType: EAggregateTypes,
  simpleNumericalAggregation: { id: string; value: string | number; selected: boolean }[],
) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
    case EAggregateTypes.AVG:
    case EAggregateTypes.MIN:
    case EAggregateTypes.MED:
    case EAggregateTypes.MAX:
    default:
      // NOTE: @puehringer: In the future, if different types are used, make sure it is exhaustive:
      // const aggT: never = aggregateType;
      return simpleNumericalAggregation.map((d) => ({
        category: undefined as undefined,
        selectedIds: d.selected ? [d.id] : [],
        group: undefined as undefined,
        categoryCount: undefined as undefined,
        aggregatedValue: d.value as number,
        count: 1,
        ids: [d.id],
      }));
  }
}

function experimentalSimpleCategoricalAggregation({
  experimentalBarDataColumns,
  selectedMap,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
}) {
  const mergedData = experimentalSimpleNumericalAggregation({ experimentalBarDataColumns, selectedMap });
  const groupedData = d3.group(mergedData, (d) => d.category);
  const groupedDataArray = Array.from(groupedData, ([key, value]) => ({
    category: key as string | number,
    values: value as { id: string; value: number; category: string; selected: boolean }[],
  }));

  return groupedDataArray;
}

function experimentalCategoricalAggregationBasedOnAggregationType(
  aggregateType: EAggregateTypes,
  simpleCategoricalAggregation: { category: string | number; values: { id: string; value: number; category: string; selected: boolean }[] }[],
) {
  const aggregationLookup: Record<EAggregateTypes, (values: { id: string; value: number; category: string; selected: boolean }[]) => number> = {
    [EAggregateTypes.COUNT]: (values) => values.length,
    [EAggregateTypes.AVG]: (values) => d3.mean(values.map((value) => value.value)),
    [EAggregateTypes.MIN]: (values) => d3.min(values.map((value) => value.value)),
    [EAggregateTypes.MED]: (values) => d3.median(values.map((value) => value.value)),
    [EAggregateTypes.MAX]: (values) => d3.max(values.map((value) => value.value)),
  };

  return simpleCategoricalAggregation.map((d) => ({
    category: d.category,
    selectedIds: d.values.reduce((acc: string[], point) => {
      if (point.selected) acc.push(point.id);
      return acc;
    }, []),
    group: undefined as undefined,
    categoryCount: undefined as undefined,
    aggregatedValue: aggregationLookup[aggregateType](d.values),
    count: d.values.length,
    ids: d.values.map((value) => value.id),
  }));
}

function experimentalBinnedAggregation({
  experimentalBarDataColumns,
  selectedMap,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
}) {
  // TODO: @dv-usama-ansari: WIP
  return [];
  // const resolvedCategoricalValuesMap = new Map<string, string | number>(
  //   experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((item) => [item.id, item.val]) ?? [],
  // );

  // const categoryCountMap = d3.group(experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues, (d) => d.val);

  // const resolvedGroupedValuesMap = new Map<string, string | number>(
  //   experimentalBarDataColumns?.awaitedGroupColumnValues?.resolvedValues?.map((item) => [item.id, item.val]) ?? [],
  // );
  // const selectedIdsMap = new Map<string, boolean>(
  //   experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((val) => [val.id, Boolean(selectedMap?.[val?.id])] as const) ?? [],
  // );
  // const mergedData =
  //   experimentalBarDataColumns?.awaitedGroupColumnValues?.resolvedValues.map((v) => {
  //     const category = resolvedCategoricalValuesMap.get(v.id);
  //     const group = resolvedGroupedValuesMap.get(v.id);
  //     const selectedFlag = selectedIdsMap.get(v.id);
  //     return { id: v.id, value: v.val, group, category, selected: selectedFlag };
  //   }) ?? [];

  // const groupedData = d3.group(
  //   mergedData,
  //   (d) => d.group,
  //   (d) => d.category,
  // );

  // const binnedData = Array.from(groupedData, ([group, categories]) => {
  //   const categoryArray = Array.from(categories, ([category, values]) => {
  //     return { category, values };
  //   });
  //   return { group, categories: categoryArray };
  // }).reduce((acc, point) => {
  //   point.categories.forEach((category) => {
  //     acc.push({ ...category, group: point.group, categoryCount: categoryCountMap.get(category.category).length });
  //   });
  //   return acc;
  // }, []);

  // return binnedData;
}

function experimentalGroupedAggregation({
  experimentalBarDataColumns,
  selectedMap,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
}) {
  const resolvedCategoricalValuesMap = new Map<string, string | number>(
    experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((item) => [item.id, item.val]) ?? [],
  );

  const categoryCountMap = d3.group(experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues, (d) => d.val);

  const resolvedGroupedValuesMap = new Map<string, string | number>(
    experimentalBarDataColumns?.awaitedGroupColumnValues?.resolvedValues?.map((item) => [item.id, item.val]) ?? [],
  );
  const selectedIdsMap = new Map<string, boolean>(
    experimentalBarDataColumns?.awaitedColumnValues?.resolvedValues?.map((val) => [val.id, Boolean(selectedMap?.[val?.id])] as const) ?? [],
  );
  const mergedData =
    experimentalBarDataColumns?.awaitedGroupColumnValues?.resolvedValues.map((v) => {
      const category = resolvedCategoricalValuesMap.get(v.id);
      const group = resolvedGroupedValuesMap.get(v.id);
      const selectedFlag = selectedIdsMap.get(v.id);
      return { id: v.id, value: v.val, group, category, selected: selectedFlag };
    }) ?? [];

  const groupedData = d3.group(
    mergedData,
    (d) => d.group,
    (d) => d.category,
  );

  const flattenedGroupedData = Array.from(groupedData, ([group, categories]) => {
    const categoryArray = Array.from(categories, ([category, values]) => {
      return { category, values };
    });
    return { group, categories: categoryArray };
  }).reduce((acc, point) => {
    point.categories.forEach((category) => {
      acc.push({ ...category, group: point.group, categoryCount: categoryCountMap.get(category.category).length });
    });
    return acc;
  }, []);

  return flattenedGroupedData;
}

function experimentalGroupedDataAggregation({
  experimentalBarDataColumns,
  selectedMap,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
}) {
  const isNumericalGrouping = experimentalBarDataColumns?.awaitedGroupColumnValues?.type === EColumnTypes.NUMERICAL;
  const isCategoricalGrouping = experimentalBarDataColumns?.awaitedGroupColumnValues?.type === EColumnTypes.CATEGORICAL;

  if (isNumericalGrouping) {
    const binnedAggregation = experimentalBinnedAggregation({ experimentalBarDataColumns, selectedMap });
    return binnedAggregation;
  }

  if (isCategoricalGrouping) {
    const groupedAggregation = experimentalGroupedAggregation({ experimentalBarDataColumns, selectedMap });
    return groupedAggregation;
  }

  return [];
}

function experimentalGroupedDataAggregationBasedOnAggregationType(
  aggregateType: EAggregateTypes,
  groupedDataAggregation: {
    group: string | number;
    category: string | number;
    categoryCount: number;
    values: { id: string; value: number; category: string | number; selected: boolean; group: string | number }[];
  }[],
) {
  const aggregationLookup = {
    [EAggregateTypes.COUNT]: (values) => values.length,
    [EAggregateTypes.AVG]: (values) => d3.mean(values.map((value) => value.value)),
    [EAggregateTypes.MIN]: (values) => d3.min(values.map((value) => value.value)),
    [EAggregateTypes.MED]: (values) => d3.median(values.map((value) => value.value)),
    [EAggregateTypes.MAX]: (values) => d3.max(values.map((value) => value.value)),
  } satisfies Record<EAggregateTypes, (values: { id: string; value: number; category: string | number; selected: boolean }[]) => number>;

  return groupedDataAggregation.map((d) => ({
    category: d.category,
    selectedIds: d.values.reduce((acc: string[], point) => {
      if (point.selected) acc.push(point.id);
      return acc;
    }, []),
    group: d.group,
    categoryCount: d.categoryCount,
    aggregatedValue: aggregationLookup[aggregateType](d.values),
    count: d.values.length,
    ids: d.values.map((value) => value.id),
  }));
}

// TODO: @dv-usama-ansari: Implement grouping and binning as per the existing implementation
export function experimentalGroupByAggregateType({
  experimentalBarDataColumns,
  selectedMap,
  aggregateType,
}: {
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>> | undefined;
  selectedMap: Record<string, boolean>;
  aggregateType: EAggregateTypes;
}) {
  const isCategoricalColumn = experimentalBarDataColumns?.awaitedColumnValues?.type === EColumnTypes.CATEGORICAL;
  const isNumericalColumn = experimentalBarDataColumns?.awaitedColumnValues?.type === EColumnTypes.NUMERICAL;
  const isGroupedColumn = !!experimentalBarDataColumns?.awaitedGroupColumnValues;

  if (isGroupedColumn) {
    const groupedDataAggregation = experimentalGroupedDataAggregation({ experimentalBarDataColumns, selectedMap });
    return experimentalGroupedDataAggregationBasedOnAggregationType(aggregateType, groupedDataAggregation);
  }

  if (isCategoricalColumn) {
    const simpleCategoricalAggregation = experimentalSimpleCategoricalAggregation({ experimentalBarDataColumns, selectedMap });
    return experimentalCategoricalAggregationBasedOnAggregationType(aggregateType, simpleCategoricalAggregation);
  }
  if (isNumericalColumn) {
    const simpleNumericalAggregation = experimentalSimpleNumericalAggregation({ experimentalBarDataColumns, selectedMap });
    return experimentalNumericalAggregationBasedOnAggregationType(aggregateType, simpleNumericalAggregation);
  }

  return [];
}
