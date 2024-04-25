/* eslint-disable @typescript-eslint/ban-ts-comment */
import { addFunction, op, table } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import { useMemo } from 'react';
import { EAggregateTypes } from '../../interfaces';
import { SortTypes } from '../interfaces';
import { getBarData, sortTableBySortType } from '../utils';

export function useGetBarScales({
  aggregateType,
  allColumns,
  categoryFilter,
  height,
  isVertical,
  margin,
  selectedMap,
  sortType,
  width,
}: {
  aggregateType: EAggregateTypes;
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  categoryFilter: string | null;
  height: number;
  isVertical: boolean;
  margin: { top: number; left: number; bottom: number; right: number };
  selectedMap: Record<string, boolean>;
  sortType: SortTypes;
  width: number;
}): {
  aggregatedTable: ColumnTable;
  baseTable: ColumnTable;
  categoryValueScale: d3.ScaleBand<string>;
  categoryCountScale: d3.ScaleLinear<number, number>;
  numericalValueScale: d3.ScaleLinear<number, number>;
  numericalIdScale: d3.ScaleBand<string>;
} {
  const baseTable = useMemo(() => {
    if (allColumns?.catColVals) {
      return table({
        category: allColumns?.catColVals?.resolvedValues?.map((val) => val?.val) ?? [],
        group: allColumns?.groupColVals?.resolvedValues?.map((val) => val?.val) ?? [],
        multiples: allColumns?.multiplesColVals?.resolvedValues?.map((val) => val?.val) ?? [],
        selected: allColumns?.catColVals?.resolvedValues?.map((val) => (selectedMap[val?.id] ? 1 : 0)) ?? [],
        aggregateVal: allColumns?.aggregateColVals?.resolvedValues?.map((val) => val?.val) ?? [],
        id: allColumns?.catColVals?.resolvedValues?.map((val) => val?.id) ?? [],
      });
    }
    if (allColumns?.numColVals) {
      return table({
        numerical: allColumns?.numColVals?.resolvedValues?.map((val) => val?.val) ?? [],
        selected: allColumns?.numColVals?.resolvedValues?.map((val) => (selectedMap[val?.id] ? 1 : 0)) ?? [],
        id: allColumns?.numColVals?.resolvedValues?.map((val) => val?.id) ?? [],
      });
    }

    return null;
  }, [allColumns, selectedMap]);

  const aggregateFunc = useMemo(() => {
    switch (aggregateType) {
      case EAggregateTypes.COUNT:
        return (d) => op.count();
      case EAggregateTypes.AVG:
        return (d) => op.average(d.aggregateVal);
      case EAggregateTypes.MIN:
        return (d) => op.min(d.aggregateVal);
      case EAggregateTypes.MED:
        return (d) => op.median(d.aggregateVal);
      case EAggregateTypes.MAX:
        return (d) => op.max(d.aggregateVal);
      default:
        return (d) => op.count();
    }
  }, [aggregateType]);

  const aggregatedTable = useMemo(() => {
    if (allColumns?.catColVals) {
      let catColTable = baseTable;

      if (categoryFilter && allColumns?.multiplesColVals) {
        catColTable = baseTable.params({ categoryFilter }).filter((d, $) => d.multiples === $.categoryFilter);
      }

      addFunction('aggregateFunc', aggregateFunc, { override: true });

      return catColTable
        .groupby('category')
        .rollup({
          aggregateVal: aggregateFunc,
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('category');
    }

    if (allColumns?.numColVals) {
      const numColTable = baseTable;
      return numColTable.groupby('numerical');
    }

    return null;
  }, [aggregateFunc, allColumns?.catColVals, allColumns?.multiplesColVals, allColumns?.numColVals, baseTable, categoryFilter]);

  const categoryValueScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.catColVals) return null;
    const range = isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top];
    const domain = sortTableBySortType(aggregatedTable, sortType).array('category').slice(0, 100);
    return d3.scaleBand().range(range).domain(domain).padding(0.2);
  }, [aggregatedTable, allColumns?.catColVals, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  const categoryCountScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.catColVals) return null;
    const range = isVertical ? [height - margin.bottom, margin.top] : [width - margin.right, margin.left];
    const domain = [0, +d3.max(aggregatedTable.array('aggregateVal')) + +d3.max(aggregatedTable.array('aggregateVal')) / 25];
    return d3.scaleLinear().range(range).domain(domain);
  }, [aggregatedTable, allColumns?.catColVals, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, width]);

  const numericalValueScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.numColVals) return null;
    const range = isVertical ? [height - margin.bottom, margin.top] : [width - margin.right, margin.left];
    const tableValues = sortTableBySortType(aggregatedTable, sortType).array('numerical');
    const domain = [+d3.min(tableValues), +d3.max(tableValues)];
    return d3.scaleLinear().range(range).domain(domain);
  }, [aggregatedTable, allColumns?.numColVals, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  const numericalIdScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.numColVals) return null;
    const range = isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top];
    const domain = aggregatedTable.array('id').slice(0, 100);
    return d3.scaleBand().range(range).domain(domain).padding(0.2);
  }, [aggregatedTable, allColumns?.numColVals, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, width]);

  return {
    aggregatedTable,
    baseTable,
    categoryValueScale,
    categoryCountScale,
    numericalValueScale,
    numericalIdScale,
  };
}
