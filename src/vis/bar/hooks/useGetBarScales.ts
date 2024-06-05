/* eslint-disable @typescript-eslint/ban-ts-comment */
import { addFunction, op, table } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import { useMemo } from 'react';
import { EAggregateTypes } from '../../interfaces';
import { EBarDirection, IBarConfig, SortTypes } from '../interfaces';
import { experimentalGetBarData, experimentalGroupByAggregateType, experimentalSortBySortType, getBarData, sortTableBySortType } from '../utils';

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
        facets: allColumns?.facetsColVals?.resolvedValues?.map((val) => val?.val) ?? [],
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

      if (categoryFilter && allColumns?.facetsColVals) {
        catColTable = baseTable.params({ categoryFilter }).filter((d, $) => d.facets === $.categoryFilter);
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
  }, [aggregateFunc, allColumns?.catColVals, allColumns?.facetsColVals, allColumns?.numColVals, baseTable, categoryFilter]);

  const categoryValueScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.catColVals) return null;
    const range = isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top];
    const domain = sortTableBySortType(aggregatedTable, sortType).array('category').slice(0, 20);
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
    const range = isVertical ? [height - margin.bottom, margin.top] : [margin.left, width - margin.right];
    const tableValues = sortTableBySortType(aggregatedTable, sortType).array('numerical');
    const domain = [Math.min(Math.floor(+d3.min(tableValues)), 0), Math.max(Math.ceil(+d3.max(tableValues)), 0)];
    return d3.scaleLinear().range(range).domain(domain);
  }, [aggregatedTable, allColumns?.numColVals, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  const numericalIdScale = useMemo(() => {
    if (!aggregatedTable || !allColumns?.numColVals) return null;
    const range = isVertical ? [margin.left, width - margin.right] : [margin.top, height - margin.bottom];
    const domain = sortTableBySortType(aggregatedTable, SortTypes.ID_DESC).array('id').slice(0, 100);
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

export function useExperimentalGetBarScales({
  experimentalBarDataColumns,
  config,
  height,
  margin,
  sortType,
  width,
}: {
  config: IBarConfig;
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>>;
  height: number;
  margin: { top: number; left: number; bottom: number; right: number };
  sortType: SortTypes;
  width: number;
}) {
  const isVertical = useMemo(() => config.direction === EBarDirection.VERTICAL, [config.direction]);
  const experimentalAggregatedData = useMemo(
    () =>
      experimentalGroupByAggregateType({
        aggregateType: config.aggregateType,
        experimentalBarDataColumns,
        selectedMap: {},
      }),
    [config.aggregateType, experimentalBarDataColumns],
  );

  const categoryValueScale = useMemo(() => {
    if (!config.catColumnSelected?.name) return null;
    const range = isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top];
    const sortedData = experimentalSortBySortType([...experimentalAggregatedData], sortType);
    const domain = (sortedData ?? [])?.map((value) => value.category as string);
    return d3.scaleBand().range(range).domain(domain).padding(0.2);
  }, [config.catColumnSelected?.name, experimentalAggregatedData, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  const categoryCountScale = useMemo(() => {
    if (!config.catColumnSelected?.name) return null;
    const range = isVertical ? [height - margin.bottom, margin.top] : [width - margin.right, margin.left];
    const aggregatedValue = Math.max(...experimentalAggregatedData.map((group) => group.aggregatedValue));
    const domain = [0, aggregatedValue + aggregatedValue / 25];
    return d3.scaleLinear().range(range).domain(domain);
  }, [config.catColumnSelected?.name, experimentalAggregatedData, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, width]);

  const numericalValueScale = useMemo(() => {
    if (!config.numColumnSelected) return null;
    const range = isVertical ? [height - margin.bottom, margin.top] : [margin.left, width - margin.right];
    const sortedData = experimentalSortBySortType([...experimentalAggregatedData], sortType);
    const tableValues = (sortedData ?? []).map((value) => value.aggregatedValue);
    const domain = [Math.min(Math.floor(+d3.min(tableValues)), 0), Math.max(Math.ceil(+d3.max(tableValues)), 0)];
    return d3.scaleLinear().range(range).domain(domain);
  }, [config.numColumnSelected, experimentalAggregatedData, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  const numericalIdScale = useMemo(() => {
    if (!config.numColumnSelected) return null;
    const range = isVertical ? [margin.left, width - margin.right] : [margin.top, height - margin.bottom];
    const sortedData = experimentalSortBySortType([...experimentalAggregatedData], sortType);
    const domain = (sortedData ?? []).map((value) => value.category as string).slice(0, 100);
    return d3.scaleBand().range(range).domain(domain).padding(0.2);
  }, [config.numColumnSelected, experimentalAggregatedData, height, isVertical, margin.bottom, margin.left, margin.right, margin.top, sortType, width]);

  return { categoryValueScale, categoryCountScale, numericalValueScale, numericalIdScale };
}
