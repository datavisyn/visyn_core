import React, { useEffect, useMemo, useRef, useState } from 'react';
import { all, desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import { Box, SimpleGrid } from '@mantine/core';
import { EBarGroupingType, IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';
import { YAxis } from './YAxis';
import { XAxis } from './XAxis';
import { SingleBar } from './SingleBar';
import { GroupedBars } from './GroupedBars';
import { SimpleBars } from './SimpleBars';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

const margin = {
  top: 25,
  bottom: 25,
  left: 25,
  right: 100,
};

export function BarChart({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group, config.multiples]);

  const ref = useRef<HTMLDivElement>(null);

  // const aggregatedTable = useMemo(() => {
  //   if (colsStatus === 'success') {
  //     const myTable = table({ category: allColumns.catColVals.resolvedValues.map((val) => val.val) });

  //     const grouped = myTable.groupby('category').count().orderby('category');

  //     return grouped;
  //   }

  //   return null;
  // }, [allColumns?.catColVals.resolvedValues, colsStatus]);

  // const groupedTable = useMemo(() => {
  //   if (colsStatus === 'success' && allColumns.groupColVals) {
  //     const myTable = table({
  //       category: allColumns.catColVals.resolvedValues.map((val) => val.val),
  //       group: allColumns.groupColVals.resolvedValues.map((val) => val.val),
  //     });

  //     const grouped = myTable.groupby('category', 'group').count().orderby('category');

  //     return grouped;
  //   }

  //   return null;
  // }, [allColumns, colsStatus]);

  // const multiplesAndGroupTable = useMemo(() => {
  //   if (colsStatus === 'success' && allColumns.groupColVals && allColumns.multiplesColVals) {
  //     const myTable = table({
  //       category: allColumns.catColVals.resolvedValues.map((val) => val.val),
  //       group: allColumns.groupColVals.resolvedValues.map((val) => val.val),
  //       multiples: allColumns.multiplesColVals.resolvedValues.map((val) => val.val),
  //     });

  //     const grouped = myTable.groupby('category', 'group', 'multiples').count().orderby('category');

  //     grouped.print();

  //     return grouped;
  //   }

  //   return null;
  // }, [allColumns, colsStatus]);

  // const multiplesTable = useMemo(() => {
  //   if (colsStatus === 'success' && allColumns.multiplesColVals) {
  //     const myTable = table({
  //       category: allColumns.catColVals.resolvedValues.map((val) => val.val),
  //       multiples: allColumns.multiplesColVals.resolvedValues.map((val) => val.val),
  //     });

  //     const grouped = myTable.groupby('category', 'multiples').count().orderby('category');

  //     grouped.print();

  //     return grouped;
  //   }

  //   return null;
  // }, [allColumns, colsStatus]);

  // const groupColorScale = useMemo(() => {
  //   if (!groupedTable) return null;

  //   const newGroup = groupedTable.ungroup().groupby('group').count();

  //   return d3.scaleOrdinal<string>().domain(newGroup.array('group')).range(d3.schemeCategory10);
  // }, [groupedTable]);

  // const groupScale = useMemo(() => {
  //   if (!aggregatedTable || !groupedTable) return null;
  //   const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

  //   return d3.scaleBand().range([0, categoryScale.bandwidth()]).domain(newGroup.array('group')).padding(0.1);
  // }, [aggregatedTable, categoryScale, groupedTable]);

  // const bars = useMemo(() => {
  //   if (config.group && groupedTable && config.groupType === EBarGroupingType.GROUP) {
  //     return groupedTable
  //       .groupby('category')
  //       .objects()
  //       .map((row: { category: string; group: string; count: number }) => {
  //         return (
  //           <SingleBar
  //             key={row.category + row.group}
  //             x={categoryScale(row.category) + groupScale(row.group)}
  //             width={groupScale.bandwidth()}
  //             y={countScale(row.count)}
  //             value={row.count}
  //             height={height + margin.top - countScale(row.count)}
  //             color={groupColorScale(row.group)}
  //           />
  //         );
  //       });
  //   }
  //   if (config.group && groupedTable && config.groupType === EBarGroupingType.STACK) {
  //     let heightSoFar = 0;
  //     let currentCategory = '';
  //     return groupedTable.objects().map((row: { category: string; group: string; count: number }) => {
  //       if (currentCategory !== row.category) {
  //         heightSoFar = 0;
  //         currentCategory = row.category;
  //       }

  //       const myHeight = heightSoFar;
  //       heightSoFar = myHeight + height + margin.top - countScale(row.count);

  //       return (
  //         <SingleBar
  //           key={row.category + row.group}
  //           x={categoryScale(row.category)}
  //           width={categoryScale.bandwidth()}
  //           y={countScale(row.count) - myHeight}
  //           value={row.count}
  //           height={height + margin.top - countScale(row.count)}
  //           color={groupColorScale(row.group)}
  //         />
  //       );
  //     });
  //   }
  //   if (aggregatedTable) {
  //     return aggregatedTable.objects().map((row: { category: string; count: number }) => {
  //       return (
  //         <SingleBar
  //           key={row.category}
  //           x={categoryScale(row.category)}
  //           width={categoryScale.bandwidth()}
  //           y={countScale(row.count)}
  //           value={row.count}
  //           height={height + margin.top - countScale(row.count)}
  //         />
  //       );
  //     });
  //   }

  //   return null;
  // }, [aggregatedTable, categoryScale, config.group, config.groupType, countScale, groupColorScale, groupScale, groupedTable, height]);

  console.log('looping?');
  return (
    <Box ref={ref} style={{ width: '100%', height: '100%' }}>
      <SimpleGrid style={{ height: '100%' }} cols={config.numColumnsSelected.length > 2 ? config.numColumnsSelected.length : 1}>
        {config.group ? <GroupedBars config={config} columns={columns} /> : <SimpleBars config={config} columns={columns} />}
      </SimpleGrid>
    </Box>
  );
}
