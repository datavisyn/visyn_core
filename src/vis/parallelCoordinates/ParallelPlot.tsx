import * as React from 'react';
import * as d3v7 from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { Group, Stack } from '@mantine/core';
import { IParallelCoordinatesConfig, VisColumn } from '../interfaces';
import { ParallelYAxis } from './YAxis';

import { useAsync } from '../../hooks';
import { getParallelData } from './utils';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

const margin = {
  top: 30,
  right: 10,
  bottom: 10,
  left: 30,
};

export function ParallelPlot({ columns, config }: { config: IParallelCoordinatesConfig; columns: VisColumn[] }) {
  const [ref, { width, height }] = useResizeObserver();
  const { value: allColumns, status: colsStatus } = useAsync(getParallelData, [columns, config?.numColumnsSelected, config?.catColumnsSelected]);

  const oneNumCol = allColumns?.numColVals?.[0];
  const yScales = React.useMemo(() => {
    if (allColumns?.numColVals.length === 0) return null;
    const allNuimericalScales = allColumns?.numColVals?.map((col) => {
      const scale = d3v7
        .scaleLinear()
        .domain(d3v7.extent(col.resolvedValues.map((v) => v.val as number)))
        .range([height, margin.top]);
      return {
        id: col.info.name,
        scale,
      };
    });
  }, [allColumns?.numColVals, height]);

  const xScale = React.useMemo(() => {
    return d3v7
      .scaleBand()
      .domain(allColumns?.numColVals.map((col) => col.info.name as string))
      .range([margin.left, width - margin.right]);
  }, [allColumns?.numColVals, width]);
  // const yScale = React.useMemo(() => {
  //   if (!oneNumCol) return null;
  //   return d3v7
  //     .scaleLinear()
  //     .domain(d3v7.extent(oneNumCol.resolvedValues.map((v) => v.val as number)))
  //     .range([height, margin.top]);
  // }, [height, oneNumCol]);
  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {xScale ? xScale() : null}
      {yScales ? yScales.map((yScale, index) => <ParallelYAxis key={index} yScale={yScale} xRange={[0, 0]} horizontalPosition={xScale()} />) : null}
      {/* <path stroke="black" strokeWidth={2} d=" M 2,2 h 20 " /> */}
    </svg>
  );
}
