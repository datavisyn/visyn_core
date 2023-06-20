import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import { Popover } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { corrcoeff, studentt } from 'jstat';
import { ICorrelationConfig, VisColumn } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CircleCorrelationPair, CorrelationPairProps } from './components/CircleCorrelationPair';
import { Grid } from './components/CorrelationMatrixAxis';
import { CorrelationTooltip } from './components/CorrelationTooltip';
import { Legend } from './components/CorrelationLegend';

const padding = { top: 16, right: 16, bottom: 16, left: 16 };
const margin = {
  top: 100,
  right: 80,
  bottom: 10,
  left: 100,
};
const CIRCLE_MIN_SIZE = 10;

export function CorrelationMatrix({ config, columns }: { config: ICorrelationConfig; columns: VisColumn[] }) {
  const data = useAsync(getCorrelationMatrixData, [columns, config.numColumnsSelected]);

  const [ref, { width, height }] = useResizeObserver();

  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;

  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);

  const colorScale = scaleLinear<string, string>().domain([-1, 0, 1]).range(['#003367', '#ffffff', '#6f0000']);

  const names = React.useMemo(() => {
    return data.value?.numericalColumns.map((column) => column.info.name);
  }, [data]);

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
    const correlationPairs = [] as CorrelationPairProps[];

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
          xi: x,
          yi: y,
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
        correlationPairs.push(value);
      }
    }

    return correlationPairs;
  }, [data, radiusScale, xScale, yScale]);

  const filteredCorrelationPairs = React.useMemo(() => {
    if (!memoizedCorrelationPairs) return null;

    if (config.showSignificant) {
      return memoizedCorrelationPairs.filter((pair) => pair.pValue < 0.05);
    }
    return memoizedCorrelationPairs;
  }, [config.showSignificant, memoizedCorrelationPairs]);

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
        {names ? <Grid width={boundsWidth} height={boundsHeight} names={names} /> : null}

        {hover ? (
          <Popover withArrow shadow="md" withinPortal opened>
            <Popover.Target>
              <rect
                fill="transparent"
                key={`${hover.x}${hover.y}`}
                x={hover.x * xScale.bandwidth()}
                y={hover.y * yScale.bandwidth()}
                width={xScale.bandwidth()}
                height={yScale.bandwidth()}
              />
            </Popover.Target>
            <Popover.Dropdown>
              <CorrelationTooltip
                value={filteredCorrelationPairs.find(
                  (value) => (value.xi === hover.x && value.yi === hover.y) || (value.xi === hover.y && value.yi === hover.x),
                )}
              />
            </Popover.Dropdown>
          </Popover>
        ) : null}

        {filteredCorrelationPairs?.map((value) => {
          return (
            <CircleCorrelationPair
              key={`${value.xName}-${value.yName}`}
              value={value}
              hover={(hover?.x === value.xi && hover?.y === value.yi) || (hover?.y === value.xi && hover?.x === value.yi)}
              setHovered={setHover}
              fill={colorScale(value.correlation)}
              boundingRect={{ width: xScale.bandwidth(), height: yScale.bandwidth() }}
            />
          );
        })}
        {labelsDiagonal}

        <Legend xPos={boundsWidth + 20} height={boundsHeight} colorScale={colorScale} margin={margin} />
      </g>
    </svg>
  );
}
