import React, { useEffect, useMemo, useRef, useState } from 'react';
import { all, desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import { IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
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
  right: 25,
};

const barPadding = 10;

export function SimpleBars({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group]);

  console.log(allColumns);

  const [height, setHeight] = useState<number>(600);
  const [width, setWidth] = useState<number>(600);

  const aggregatedTable = useMemo(() => {
    if (colsStatus === 'success') {
      const myTable = table({ category: allColumns.catColVals.resolvedValues.map((val) => val.val) });

      const grouped = myTable.groupby('category').count();

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
      .domain(aggregatedTable.array('category'));
  }, [aggregatedTable, width]);

  return (
    <svg width={width + 100} height={height + 100}>
      <g>
        {countScale && categoryScale ? (
          <YAxis yScale={countScale} xRange={[categoryScale.range()[1], categoryScale.range()[0]]} horizontalPosition={margin.left} />
        ) : null}
        {categoryScale && countScale ? (
          <XAxis xScale={categoryScale} yRange={[countScale.range()[1], countScale.range()[0]]} vertPosition={height + margin.top} />
        ) : null}
        {aggregatedTable
          ? aggregatedTable.objects().map((row: { category: string; count: number }) => {
              return (
                <SingleBar
                  key={row.category}
                  x={categoryScale(row.category) + barPadding}
                  width={categoryScale.bandwidth() - barPadding * 2}
                  y={countScale(row.count)}
                  value={row.count}
                  height={height + margin.top - countScale(row.count)}
                />
              );
            })
          : null}
      </g>
    </svg>
  );
}
