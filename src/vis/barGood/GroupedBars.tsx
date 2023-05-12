import React, { useEffect, useMemo, useRef, useState } from 'react';
import { all, desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import { Box, Container, SimpleGrid } from '@mantine/core';
import { EBarGroupingType, IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';
import { YAxis } from './YAxis';
import { XAxis } from './XAxis';
import { SingleBar } from './SingleBar';

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

export function GroupedBars({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group, config.multiples]);

  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const ref = useRef<HTMLDivElement>(null);

  // resize observer for setting size of the svg and updating on size change
  useEffect(() => {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      setHeight(entries[0].contentRect.height - margin.top - margin.bottom);
      setWidth(entries[0].contentRect.width - margin.left - margin.right);
    });

    if (ref) {
      ro.observe(ref.current);
    }

    return () => {
      ro.disconnect();
    };
  }, []);

  const aggregatedTable = useMemo(() => {
    if (colsStatus === 'success') {
      const myTable = table({ category: allColumns.catColVals.resolvedValues.map((val) => val.val) });

      const grouped = myTable.groupby('category').count().orderby('category');

      return grouped;
    }

    return null;
  }, [allColumns?.catColVals.resolvedValues, colsStatus]);

  const countScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleLinear()
      .range([height + margin.top, margin.top])
      .domain([0, +d3.max(aggregatedTable.array('count'))]);
  }, [aggregatedTable, height]);

  const categoryScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleBand()
      .range([width + margin.left, margin.left])
      .domain(aggregatedTable.array('category'))
      .padding(0.2);
  }, [aggregatedTable, width]);

  const groupedTable = useMemo(() => {
    if (colsStatus === 'success' && allColumns.groupColVals) {
      const myTable = table({
        category: allColumns.catColVals.resolvedValues.map((val) => val.val),
        group: allColumns.groupColVals.resolvedValues.map((val) => val.val),
      });

      const grouped = myTable.groupby('category', 'group').count().orderby('category');

      return grouped;
    }

    return null;
  }, [allColumns, colsStatus]);

  const groupColorScale = useMemo(() => {
    if (!groupedTable) return null;

    const newGroup = groupedTable.ungroup().groupby('group').count();

    return d3.scaleOrdinal<string>().domain(newGroup.array('group')).range(d3.schemeCategory10);
  }, [groupedTable]);

  const groupScale = useMemo(() => {
    if (!groupedTable) return null;
    const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

    return d3.scaleBand().range([0, categoryScale.bandwidth()]).domain(newGroup.array('group')).padding(0.1);
  }, [categoryScale, groupedTable]);

  const bars = useMemo(() => {
    if (groupedTable) {
      return groupedTable
        .groupby('category')
        .objects()
        .map((row: { category: string; group: string; count: number }) => {
          return (
            <SingleBar
              key={row.category + row.group}
              x={categoryScale(row.category) + groupScale(row.group)}
              width={groupScale.bandwidth()}
              y={countScale(row.count)}
              value={row.count}
              height={height + margin.top - countScale(row.count)}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [categoryScale, countScale, groupColorScale, groupScale, groupedTable, height]);

  return (
    <Box p={0} ref={ref} style={{ width: '100%', height: '100%' }}>
      <Container
        fluid
        pl={0}
        pr={0}
        sx={{
          height: height + margin.top + margin.bottom,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
          <g>
            {countScale && categoryScale ? (
              <YAxis yScale={countScale} xRange={[categoryScale.range()[1], categoryScale.range()[0]]} horizontalPosition={margin.left} />
            ) : null}
            {categoryScale && countScale ? (
              <XAxis xScale={categoryScale} yRange={[countScale.range()[1], countScale.range()[0]]} vertPosition={height + margin.top} />
            ) : null}
            {bars}
          </g>
        </svg>
      </Container>
    </Box>
  );
}
