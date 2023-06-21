import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import { AspectRatio, Box, Group, Popover } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { corrcoeff, studentt } from 'jstat';
import { ICorrelationConfig, VisColumn } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CircleCorrelationPair, CorrelationPairProps } from './components/CircleCorrelationPair';
import { CorrelationGrid } from './components/CorrelationGrid';
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
  const availableSize = Math.min(boundsWidth, boundsHeight);

  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);

  const colorScale = scaleLinear<string, string>().domain([-1, 0, 1]).range(['#000080', '#fff', '#B22222']);

  const names = React.useMemo(() => {
    return data.value?.numericalColumns.map((column) => column.info.name);
  }, [data]);

  // Scales
  const xScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, availableSize])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [data, availableSize]);

  const yScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, availableSize])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [data, availableSize]);

  const circleSizeScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    const maxSize = Math.min(xScale.bandwidth() / 2 - 4, yScale.bandwidth() / 2 - 4);
    return scaleLinear().domain([-1, 1]).range([CIRCLE_MIN_SIZE, maxSize]);
  }, [data, xScale, yScale]);

  // Calculate correlation results
  const memoizedCorrelationResults = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    const cols = data.value.numericalColumns;
    const correlationResults = [] as CorrelationPairProps[];

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
          radius: circleSizeScale(Math.abs(correlation)),
        };
        correlationResults.push(value);
      }
    }

    return correlationResults;
  }, [circleSizeScale, data, xScale, yScale]);

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
    <Group ref={ref} style={{ width: '100%', height: '100%' }} position="center">
      <svg style={{ width: availableSize + margin.left + margin.right, height: availableSize + margin.top + margin.bottom, shapeRendering: 'crispEdges' }}>
        <g width={availableSize} height={availableSize} transform={`translate(${[margin.left, margin.top].join(',')})`}>
          {names ? <CorrelationGrid width={availableSize} height={availableSize} names={names} /> : null}

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
                  value={memoizedCorrelationResults.find(
                    (value) => (value.xi === hover.x && value.yi === hover.y) || (value.xi === hover.y && value.yi === hover.x),
                  )}
                />
              </Popover.Dropdown>
            </Popover>
          ) : null}

          {memoizedCorrelationResults?.map((value) => {
            return (
              <CircleCorrelationPair
                key={`${value.xName}-${value.yName}`}
                value={value}
                hover={(hover?.x === value.xi && hover?.y === value.yi) || (hover?.y === value.xi && hover?.x === value.yi)}
                setHovered={setHover}
                fill={colorScale(value.correlation)}
                boundingRect={{ width: xScale.bandwidth(), height: yScale.bandwidth() }}
                config={config}
              />
            );
          })}

          <Legend xPos={availableSize + 20} height={boundsHeight} colorScale={colorScale} margin={margin} />
        </g>
      </svg>
    </Group>
  );
}
