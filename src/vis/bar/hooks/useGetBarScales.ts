/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { desc, op, table, addFunction } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { getBarData, sortTableBySortType } from '../utils';
import { SortTypes } from '../interfaces';
import { EAggregateTypes } from '../../interfaces';

export function useGetBarScales(
  allColumns: Awaited<ReturnType<typeof getBarData>>,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
  categoryFilter: string | null,
  isVertical: boolean,
  selectedMap: Record<string, boolean>,
  sortType: SortTypes,
  aggregateType: EAggregateTypes,
): { aggregatedTable: ColumnTable; baseTable: ColumnTable; countScale: d3.ScaleLinear<number, number>; categoryScale: d3.ScaleBand<string> } {
  const baseTable = useMemo(() => {
    if (allColumns?.catColVals) {
      return table({
        category: allColumns.catColVals.resolvedValues.map((val) => val.val),
        group: allColumns?.groupColVals?.resolvedValues.map((val) => val.val),
        facets: allColumns?.facetsColVals?.resolvedValues.map((val) => val.val) || [],
        selected: allColumns.catColVals.resolvedValues.map((val) => (selectedMap[val.id] ? 1 : 0)),
        aggregateVal: allColumns?.aggregateColVals?.resolvedValues.map((val) => val.val) || [],
        id: allColumns.catColVals.resolvedValues.map((val) => val.id),
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
      let myTable = baseTable;

      if (categoryFilter && allColumns?.facetsColVals) {
        myTable = baseTable.params({ categoryFilter }).filter((d, $) => d.facets === $.categoryFilter);
      }

      addFunction('aggregateFunc', aggregateFunc, { override: true });

      return myTable
        .groupby('category')
        .rollup({
          aggregateVal: aggregateFunc,
          count: op.count(),
          selectedCount: (d) => op.sum(d.selected),
          ids: (d) => op.array_agg(d.id),
        })
        .orderby('category');
    }

    return null;
  }, [aggregateFunc, allColumns?.catColVals, allColumns?.facetsColVals, baseTable, categoryFilter]);

  const countScale = useMemo(() => {
    if (!aggregatedTable) {
      return null;
    }
    return d3
      .scaleLinear()
      .range(isVertical ? [height - margin.bottom, margin.top] : [width - margin.right, margin.left])
      .domain([0, +d3.max(aggregatedTable.array('aggregateVal')) + +d3.max(aggregatedTable.array('aggregateVal')) / 25]);
  }, [aggregatedTable, height, isVertical, margin, width]);

  const categoryScale = useMemo(() => {
    if (!aggregatedTable) {
      return null;
    }
    return d3
      .scaleBand()
      .range(isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top])
      .domain(sortTableBySortType(aggregatedTable, sortType).array('category'))
      .padding(0.2);
  }, [aggregatedTable, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  return { aggregatedTable, baseTable, countScale, categoryScale };
}
