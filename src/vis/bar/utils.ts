import { bin as aqBin, desc, op } from 'arquero';
import { bin as d3Bin, extent, max, min } from 'd3v7';
import ColumnTable from 'arquero/dist/types/table/column-table';
import merge from 'lodash/merge';
import { resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { IBarConfig, defaultConfig, SortTypes } from './interfaces';
import { NAN_REPLACEMENT } from '../general';

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
      return tempTable.orderby(desc('count'));
    case SortTypes.COUNT_DESC:
      return tempTable.orderby('count');
    default:
      return tempTable;
  }
}

/**
 * Creates a bin lookup map based on the provided data and maximum number of bins.
 *
 * @param data - The array of VisNumericalValue objects.
 * @param maxBins - The maximum number of bins (default: 8).
 * @returns A Map object with VisNumericalValue keys and string values representing the bin names.
 */
export const createBinLookup = (data: VisNumericalValue[], maxBins: number = 8): Map<VisNumericalValue, string> => {
  // Separate null values from the data
  const nonNullData = data.filter((row) => row.val !== null);
  const nullData = data.filter((row) => row.val === null);

  // Extract the numerical values from non-null data
  const values = nonNullData.map((row) => row.val as number);

  // Create the bins using d3.bin
  const bins = d3Bin<number, number>()
    .domain(extent(values) as [number, number])
    .thresholds(maxBins)(values);

  // Create a map to hold the bin names
  const binMap = new Map<VisNumericalValue, string>();

  // Map bins to our desired structure with names and filter out empty bins
  bins
    .filter((bin) => bin.length > 0) // Filter out empty bins
    .forEach((bin) => {
      const binName = `${min(bin)} to ${max(bin)}`;
      const binRows = nonNullData.filter((row) => bin.includes(row.val as number));
      binRows.forEach((row) => {
        binMap.set(row, binName);
      });
    });

  // Add a separate bin for null values
  if (nullData.length > 0) {
    nullData.forEach((row) => {
      binMap.set(row, NAN_REPLACEMENT);
    });
  }

  return binMap;
};

// Helper function for the bar chart which bins the data depending on the aggregate type. Used for numerical column grouping
export function binByAggregateType(tempTable: ColumnTable, aggregateType: EAggregateTypes) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
      return tempTable
        .groupby('category', { group: aqBin('group', { maxbins: 9 }), group_max: aqBin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ aggregateVal: () => op.count(), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.AVG:
      return tempTable
        .groupby('category', { group: aqBin('group', { maxbins: 9 }), group_max: aqBin('group', { maxbins: 9, offset: 1 }) })
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
        .groupby('category', { group: aqBin('group', { maxbins: 9 }), group_max: aqBin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ aggregateVal: (d) => op.min(d.aggregateVal), count: op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });
    case EAggregateTypes.MED:
      return tempTable
        .groupby('category', { group: aqBin('group', { maxbins: 9 }), group_max: aqBin('group', { maxbins: 9, offset: 1 }) })
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
        .groupby('category', { group: aqBin('group', { maxbins: 9 }), group_max: aqBin('group', { maxbins: 9, offset: 1 }) })
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

export async function getBarData(
  columns: VisColumn[],
  catColumn: ColumnInfo,
  groupColumn: ColumnInfo | null,
  facetsColumn: ColumnInfo | null,
  aggregateColumn: ColumnInfo | null,
): Promise<{
  catColVals: {
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
  const catColVals = await resolveSingleColumn(columns.find((col) => col.info.id === catColumn.id));

  const groupColVals = await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id) : null);
  const facetsColVals = await resolveSingleColumn(facetsColumn ? columns.find((col) => col.info.id === facetsColumn.id) : null);
  const aggregateColVals = await resolveSingleColumn(aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id) : null);

  return { catColVals, groupColVals, facetsColVals, aggregateColVals };
}
