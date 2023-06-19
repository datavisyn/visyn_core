import * as React from 'react';
import * as d3v7 from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { table } from 'arquero';
import { EColumnTypes, IParallelCoordinatesConfig, VisColumn } from '../interfaces';
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

const removeSpace = (col: string) => col.replace(' ', '');

export function ParallelPlot({ columns, config }: { config: IParallelCoordinatesConfig; columns: VisColumn[] }) {
  const [ref, { width, height }] = useResizeObserver();
  const { value: allColumns, status: colsStatus, error } = useAsync(getParallelData, [columns, config?.numColumnsSelected, config?.catColumnsSelected]);

  const rows = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;
    const dt = table(all.reduce((acc, col) => ({ ...acc, [removeSpace(col.info.name)]: col.resolvedValues.map((v) => v.val) }), {}));
    console.log('table: ', dt);
    console.log(dt.objects());
    return dt.objects();
  }, [allColumns]);

  const yScales = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;
    return all?.map((col) => {
      let scale;
      if (col.type === EColumnTypes.NUMERICAL) {
        scale = d3v7
          .scaleLinear()
          .domain(d3v7.extent(col.resolvedValues.map((v) => v.val as number)))
          .range([height, margin.top]);
      } else {
        scale = d3v7
          .scaleBand()
          .domain(col.resolvedValues.map((c) => c.val as string))
          .range([height, margin.top]);
      }

      return {
        id: removeSpace(col.info.name),
        type: col.type,
        scale,
      };
    });
  }, [allColumns, height]);

  const xScale = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;

    return d3v7
      .scaleBand()
      .domain(all.map((c) => removeSpace(c.info.name)))
      .range([margin.left, width - margin.right]);
  }, [allColumns?.catColVals, allColumns?.numColVals, width]);

  const paths = React.useMemo(() => {
    const r = rows?.[0];
    if (!r) return null;
    const yPositions = Object.keys(r).map((col) => {
      const xPos = xScale(col);
      const yPos = yScales?.find((yScale) => yScale.id === col)?.scale(r[col]) || 0;
      return [xPos, yPos];
    });
    // yScales?.map((yScale) => {
    //   return r[yScale.id];
    // });
    console.log('yPositions: ', yPositions);
    return yPositions;
    // const xPos = xScale(col) || 0;
  }, [rows, xScale, yScales]);
  console.log('paths: ', paths);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {allColumns && yScales && xScale
        ? yScales.map((yScale) => {
            return (
              <ParallelYAxis
                key={yScale.id}
                yScale={yScale.scale}
                xRange={[margin.left, width + margin.left]}
                type={yScale.type}
                horizontalPosition={xScale(yScale.id)}
              />
            );
          })
        : null}
      {rows ? <path stroke="black" strokeWidth={2} d="M 2,2 h 20 " /> : null}
      {/* <path stroke="black" strokeWidth={2} d=" M 2,2 h 20 " /> */}
    </svg>
  );
}
