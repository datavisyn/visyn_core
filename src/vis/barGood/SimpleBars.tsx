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

const margin = {
  top: 25,
  bottom: 25,
  left: 25,
  right: 100,
};

export function SimpleBars({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group, config.multiples]);

  const [height, setHeight] = useState<number>(600);
  const [width, setWidth] = useState<number>(600);

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

  const bars = useMemo(() => {
    if (aggregatedTable && categoryScale && countScale) {
      return aggregatedTable.objects().map((row: { category: string; count: number }) => {
        return (
          <SingleBar
            key={row.category}
            x={categoryScale(row.category)}
            width={categoryScale.bandwidth()}
            y={countScale(row.count)}
            value={row.count}
            height={height + margin.top - countScale(row.count)}
          />
        );
      });
    }

    return null;
  }, [aggregatedTable, categoryScale, countScale, height]);

  return (
    <Box ref={ref} style={{ width: '100%', height: '100%' }}>
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
    </Box>
  );
}
