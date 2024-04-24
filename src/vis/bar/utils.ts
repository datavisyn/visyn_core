import { bin, desc, op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import merge from 'lodash/merge';
import { resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { IBarConfig, defaultConfig, SortTypes } from './interfaces';

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
      return tempTable.orderby('category');
    case SortTypes.CAT_DESC:
      return tempTable.orderby(desc('category'));
    case SortTypes.NUM_ASC:
      return tempTable.orderby('numerical');
    case SortTypes.NUM_DESC:
      return tempTable.orderby(desc('numerical'));
    case SortTypes.COUNT_ASC:
      return tempTable.orderby('count');
    case SortTypes.COUNT_DESC:
      return tempTable.orderby(desc('count'));
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
  columns,
  catColumn,
  numColumn,
  groupColumn,
  multiplesColumn,
  aggregateColumn,
}: {
  columns: VisColumn[];
  catColumn: ColumnInfo;
  numColumn: ColumnInfo;
  groupColumn: ColumnInfo | null;
  multiplesColumn: ColumnInfo | null;
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
  multiplesColVals: {
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
  const multiplesColVals = await resolveSingleColumn(multiplesColumn ? columns.find((col) => col.info.id === multiplesColumn.id) : null);
  const aggregateColVals = await resolveSingleColumn(aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id) : null);

  return { catColVals, numColVals, groupColVals, multiplesColVals, aggregateColVals };
}
