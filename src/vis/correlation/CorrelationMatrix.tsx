import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { corrcoeff, studentt } from 'jstat';
import { ICorrelationConfig, VisColumn } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CircleCorrelationPair, CorrelationPairProps } from './components/CircleCorrelationPair';
import { AxisTop, AxisLeft } from './components/CorrelationMatrixAxis';

const padding = { top: 16, right: 16, bottom: 16, left: 16 };
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
const CIRCLE_MIN_SIZE = 10;

export function CorrelationMatrix({ config, columns }: { config: ICorrelationConfig; columns: VisColumn[] }) {
  const data = useAsync(getCorrelationMatrixData, [columns, config.numColumnsSelected]);

  const [ref, { width, height }] = useResizeObserver();

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  // TODO: Use vis color scale
  // @ts-ignore
  const colorScale = scaleLinear().domain([-1, 0, 1]).range(['#B22222', '#fff', '#000080']);

  // Scales
  const xScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, boundsWidth])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [data, boundsWidth]);

  const yScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, boundsHeight])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [data, boundsHeight]);

  // TODO: The domain does not make sense
  const radiusScale = React.useMemo(() => {
    if (!xScale || !yScale) return null;
    return scaleLinear()
      .domain([0.2, 0])
      .range([CIRCLE_MIN_SIZE, Math.min(xScale.bandwidth() / 2 - padding.left, yScale.bandwidth() / 2 - padding.top)]);
  }, [xScale, yScale]);

  // Build correlation pairs
  const memoizedCorrelationPairs = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    const cols = data.value.numericalColumns;
    const correlationPairs = [];

    for (let x = 1; x < cols.length; x++) {
      for (let y = 0; y < x; y++) {
        const correlation = corrcoeff(
          cols[x].resolvedValues.map((resolved) => resolved.val as number),
          cols[y].resolvedValues.map((resolved) => resolved.val as number),
        );
        const tStatistic = (correlation * Math.sqrt(cols[x].resolvedValues.length - 2)) / Math.sqrt(1 - correlation ** 2);

        const cdf = studentt.cdf(tStatistic, cols[x].resolvedValues.length - 2);
        const pValue = 2 * Math.min(cdf, 1 - cdf);

        const xName = cols[x].info.name;
        const yName = cols[y].info.name;

        const value: CorrelationPairProps = {
          cxLT: xScale(yName) + xScale.bandwidth() / 2,
          cyLT: yScale(xName) + yScale.bandwidth() / 2,
          cxUT: xScale(xName) + xScale.bandwidth() / 2,
          cyUT: yScale(yName) + yScale.bandwidth() / 2,
          correlation,
          tStatistic,
          pValue,
          xName,
          yName,
          radius: radiusScale(pValue),
        };
        correlationPairs.push(
          <CircleCorrelationPair
            key={`${value.xName}-${value.yName}`}
            value={value}
            fill={colorScale(correlation)}
            boundingRect={{ width: xScale.bandwidth(), height: yScale.bandwidth() }}
          />,
        );
      }
    }

    return correlationPairs;
  }, [colorScale, data, radiusScale, xScale, yScale]);

  // Show labels on diagonal of matrix
  const labelsDiagonal = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    const cols = data.value.numericalColumns;
    const labels = [];

    cols.forEach((col) => {
      const currentX = xScale(col.info.name) + xScale.bandwidth() / 2;
      const currentY = yScale(col.info.name) + yScale.bandwidth() / 2;
      labels.push(
        <text x={currentX} y={currentY} dominantBaseline="middle" textAnchor="middle" key={`label-${col.info.name}`}>
          {col.info.name}
        </text>,
      );
    });
    return labels;
  }, [data, xScale, yScale]);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}>
      <g width={boundsWidth} height={boundsHeight} transform={`translate(${[margin.left, margin.top].join(',')})`}>
        <AxisLeft yScale={yScale} ticks={data?.value?.numericalColumns?.map((c) => ({ value: c.info.name, offset: 0 }))} width={boundsWidth} />
        <AxisTop xScale={xScale} ticks={data?.value?.numericalColumns?.map((c) => ({ value: c.info.name, offset: 0 }))} height={boundsHeight} />
        {memoizedCorrelationPairs}
        {labelsDiagonal}
      </g>
    </svg>
  );
}
