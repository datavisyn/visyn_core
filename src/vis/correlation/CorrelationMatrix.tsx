import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import * as d3 from 'd3v7';
import { Center, Group, Popover, Text } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { corrcoeff, spearmancoeff, studentt } from 'jstat';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ECorrelationType, EScaleType, ICorrelationConfig, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CorrelationPair, CorrelationPairProps } from './components/CorrelationPair';
import { CorrelationGrid } from './components/CorrelationGrid';
import { ColorLegend } from '../legend/ColorLegend';

const paddingCircle = { top: 10, right: 10, bottom: 10, left: 10 };
const CIRCLE_MIN_SIZE = 4;

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

  const availableSize = useMemo(() => {
    return Math.min(width - 75, height);
  }, [height, width]);

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
    return config.pScaleType === EScaleType.LINEAR
      ? d3.scaleSqrt().domain([0, 0.5]).range([CIRCLE_MIN_SIZE, maxSize]).clamp(true)
      : d3.scaleLog().domain([0.000000001, 0.1]).range([CIRCLE_MIN_SIZE, maxSize]).clamp(true);
  }, [config.pScaleType, data, xScale, yScale]);

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
      const currentX = xScale(col.info.name);
      const currentY = yScale(col.info.name);
      labels.push(
        <foreignObject key={`label-${col.info.name}`} x={currentX} y={currentY} width={xScale.bandwidth()} height={yScale.bandwidth()}>
          <Center style={{ height: '100%' }}>
            <Text size={14} weight={600} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {col.info.name}
            </Text>
          </Center>
        </foreignObject>,
      );
    });
    return labels;
  }, [data, xScale, yScale]);

  const svg = useMemo(() => {
    return (
      <svg style={{ height: '100%', width: `100%` }}>
        <g transform={`translate(${(width - 35 - availableSize) / 2}, 0)`}>
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
    );
  }, [availableSize, colorScale, config, labelsDiagonal, memoizedCorrelationResults, names, width, xScale, yScale]);

  return (
    <Group ref={ref} noWrap style={{ height: '100%', width: '100%', overflow: 'hidden' }} position="center" align="start" spacing="xs" pr={'50px'}>
      {svg}
      <ColorLegend format=".3~g" scale={colorScale} width={25} height={availableSize} rightMargin={(width - 35 - availableSize) / 2} range={[-1, 1]} />
    </Group>
  );
}
