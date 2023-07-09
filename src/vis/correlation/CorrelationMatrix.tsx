import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import * as d3 from 'd3v7';
import { Group, Popover } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { corrcoeff, spearmancoeff, studentt } from 'jstat';
import { ColumnInfo, EColumnTypes, ECorrelationType, ICorrelationConfig, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CorrelationPair, CorrelationPairProps } from './components/CorrelationPair';
import { CorrelationGrid } from './components/CorrelationGrid';
import { ColorLegend } from '../legend/ColorLegend';

const paddingCircle = { top: 10, right: 10, bottom: 10, left: 10 };
const CIRCLE_MIN_SIZE = 4;
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

export function CorrelationMatrix({ config, columns }: { config: ICorrelationConfig; columns: VisColumn[] }) {
  const dataAll = useAsync(getCorrelationMatrixData, [columns, config.numColumnsSelected]);
  const [data, setData] = React.useState<{ resolvedValues: (VisNumericalValue | VisCategoricalValue)[]; type: EColumnTypes; info: ColumnInfo }[]>(null);

  // Set data used for calculation and apply filter if given
  React.useEffect(() => {
    if (dataAll?.value) {
      const cols = [];
      dataAll.value.numericalColumns.forEach((col) => {
        cols.push(col);
      });
      setData(cols);
    }
  }, [dataAll.value]);

  const [ref, { width, height }] = useResizeObserver();

  console.log(width, height);

  const boundsWidth = width;
  const boundsHeight = height;
  const availableSize = Math.min(boundsWidth, boundsHeight);

  const colorScale = d3
    .scaleSequential<string, string>(
      d3.piecewise(
        d3.interpolateRgb.gamma(2.2),
        [
          '#003367',
          '#16518a',
          '#2e72ae',
          '#5093cd',
          '#77b5ea',
          '#aad7fd',
          '#F1F3F5',
          '#fac7a9',
          '#f99761',
          '#e06d3b',
          '#c2451a',
          '#99230d',
          '#6f0000',
        ].reverse(),
      ),
    )
    .domain([-1, 1]);

  const names = React.useMemo(() => {
    return data?.map((column) => column.info.name);
  }, [data]);

  // Scales
  const xScale = React.useMemo(() => {
    if (!data) return null;
    return scaleBand()
      .range([0, availableSize])
      .domain(data.map((column) => column.info.name));
  }, [data, availableSize]);

  const yScale = React.useMemo(() => {
    if (!data) return null;
    return scaleBand()
      .range([0, availableSize])
      .domain(data.map((column) => column.info.name));
  }, [data, availableSize]);

  const circleSizeScale = React.useMemo(() => {
    if (!data) return null;
    const maxSize = Math.min(xScale.bandwidth() / 2 - paddingCircle.left, yScale.bandwidth() / 2 - paddingCircle.top);
    return d3.scaleSqrt().domain([0, 1]).range([CIRCLE_MIN_SIZE, maxSize]);
  }, [data, xScale, yScale]);

  // Calculate correlation results
  const memoizedCorrelationResults = React.useMemo(() => {
    if (!data) return null;

    let coefffunc = (x: number[], y: number[]) => null;
    if (config.correlationType === ECorrelationType.PEARSON) {
      coefffunc = corrcoeff;
    } else if (config.correlationType === ECorrelationType.SPEARMAN) {
      coefffunc = spearmancoeff;
    }

    const cols = data;
    const correlationResults = [] as CorrelationPairProps[];

    for (let x = 1; x < cols.length; x++) {
      for (let y = 0; y < x; y++) {
        const correlation = coefffunc(
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
  }, [circleSizeScale, config.correlationType, data, xScale, yScale]);

  // Show labels on diagonal of matrix
  const labelsDiagonal = React.useMemo(() => {
    if (!data) return null;

    const cols = data;
    const labels = [];

    cols.forEach((col) => {
      const currentX = xScale(col.info.name) + xScale.bandwidth() / 2;
      const currentY = yScale(col.info.name) + yScale.bandwidth() / 2;
      labels.push(
        <text x={currentX} y={currentY} fontSize={14} fontWeight={600} dominantBaseline="middle" textAnchor="middle" key={`label-${col.info.name}`}>
          {col.info.name}
        </text>,
      );
    });
    return labels;
  }, [data, xScale, yScale]);

  return (
    <Group noWrap style={{ width: '100%', height: '100%' }} position="right" align="start" spacing="xs" pr="40px">
      <svg ref={ref} style={{ height: '100%', width: '100%' }}>
        <g width={availableSize} height={availableSize}>
          {names ? <CorrelationGrid width={availableSize} height={availableSize} names={names} /> : null}

          {memoizedCorrelationResults?.map((value) => {
            return (
              <CorrelationPair
                key={`${value.xName}-${value.yName}`}
                value={value}
                fill={colorScale(value.correlation)}
                boundingRect={{ width: xScale.bandwidth(), height: yScale.bandwidth() }}
                config={config}
              />
            );
          })}
          {labelsDiagonal}
        </g>
      </svg>
      <ColorLegend format=".3~g" scale={colorScale} width={25} height={availableSize} range={[-1, 1]} />
    </Group>
  );
}
