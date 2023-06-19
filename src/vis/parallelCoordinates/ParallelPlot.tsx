import * as React from 'react';
import * as d3v7 from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { Group, Stack } from '@mantine/core';
import { IParallelCoordinatesConfig, VisColumn } from '../interfaces';

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
  left: 10,
};

export function ParallelPlot({ columns, config }: { config: IParallelCoordinatesConfig; columns: VisColumn[] }) {
  const [ref, { width, height }] = useResizeObserver();
  const { value: allColumns, status: colsStatus } = useAsync(getParallelData, [columns, config?.numColumnsSelected, config?.catColumnsSelected]);

  // // create y scale
  // const yScales = React.useMemo(() => {
  //   if (!allColumns?.numColValues?.length) return;
  //   allColumns?.numColVals.map((c) => {
  //     console.log(
  //       'inside',
  //       c.resolvedValues.map((v) => v.val),
  //     );
  //     return d3v7
  //       .scaleLinear()
  //       .domain(c.resolvedValues.map((v) => v.val))
  //       .range([height - margin.bottom, margin.top]);
  //   });
  // }, [allColumns, height]);
  const yScale = React.useMemo(() => {
    if (!allColumns?.numColVals?.length) return () => null;
    console.log('inside');
    return d3v7
      .scaleLinear()
      .domain(allColumns.numColVals[0].resolvedValues.map((v) => v.val))
      .range([height - margin.bottom, margin.top]);
  }, [allColumns, height]);

  console.log('HERE', allColumns, yScale(allColumns?.numColValues?.[0]?.resolvedValues?.[0]?.id));
  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      <path stroke="black" strokeWidth={2} d=" M 2,2 h 20 " />
    </svg>
  );
}
