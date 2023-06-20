import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { table, op } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';

import { useAsync } from '../../hooks';
import { ENumericalColorScaleType, IHeatmapConfig, VisColumn } from '../interfaces';
import { HeatmapRect } from './HeatmapRect';
import { getHeatmapData } from './utils';

const interRectDistance = 1;
const margin = {
  top: 20,
  right: 20,
  bottom: 100,
  left: 100,
};

export function Heatmap({ config, columns }: { config: IHeatmapConfig; columns: VisColumn[] }) {
  const { value: allColumns } = useAsync(getHeatmapData, [columns, config?.catColumnsSelected]);
  const [ref, { width, height }] = useResizeObserver();
  const [tooltipText, setTooltipText] = React.useState<string | null>(null);

  const hasAtLeast2CatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const { xValues, yValues, groupedValues } = React.useMemo(() => {
    if (!hasAtLeast2CatCols) return { xValues: [], yValues: [], groupedValues: [] };
    const myTable = table({
      x: allColumns.catColumn[0]?.resolvedValues.map(({ val }) => val),
      y: allColumns.catColumn[1]?.resolvedValues.map(({ val }) => val),
    });
    const xVals = [...new Set(allColumns.catColumn[0]?.resolvedValues.map(({ val }) => val))];
    const yVals = [...new Set(allColumns.catColumn[1]?.resolvedValues.map(({ val }) => val))];

    return {
      xValues: xVals as string[],
      yValues: yVals as string[],
      groupedValues: myTable
        .groupby('x', 'y')
        .count()
        .impute({ count: () => 0 }, { expand: ['x', 'y'] })
        .objects() as { x: string; y: string; count: number }[],
    };
  }, [allColumns?.catColumn, hasAtLeast2CatCols]);

  const rectWidth = React.useMemo(
    () => (groupedValues.length && xValues.length && width ? (width - margin.left - margin.right - interRectDistance * xValues.length) / xValues.length : 0),
    [groupedValues?.length, width, xValues],
  );
  const rectHeight = React.useMemo(
    () => (groupedValues.length && yValues.length && height ? (height - margin.bottom - margin.top - interRectDistance * yValues.length) / yValues.length : 0),
    [groupedValues?.length, height, yValues],
  );

  const xScale = React.useMemo(
    () =>
      d3
        .scaleBand()
        .domain(xValues)
        .range([0, width - margin.left - margin.right]),
    [xValues, width],
  );

  const yScale = React.useMemo(
    () =>
      d3
        .scaleBand()
        .domain(yValues)
        .range([0, height - margin.top - margin.bottom]),
    [yValues, height],
  );

  const colorScale = React.useMemo(() => {
    if (!hasAtLeast2CatCols) return d3.scaleSequential(d3.interpolateReds);
    return config?.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
      ? d3.scaleSequential<string, string>(d3.interpolateBlues).domain(d3.extent(groupedValues, (d) => d.count as number))
      : config?.numColorScaleType === ENumericalColorScaleType.DIVERGENT
      ? d3.scaleDiverging<string, string>(d3.interpolatePiYG).domain(d3.extent(groupedValues, (d) => d.count as number))
      : null;
  }, [config?.numColorScaleType, hasAtLeast2CatCols, groupedValues]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }} spacing={0} align="center" justify="center">
      {!hasAtLeast2CatCols ? (
        <Text align="center" color="dimmed">
          Select at least 2 categorical columns to display heatmap
        </Text>
      ) : null}
      <>
        <Group noWrap sx={{ width: '100%', height: '100%' }} spacing={0}>
          {hasAtLeast2CatCols && (
            <Text color="dimmed" sx={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
              {allColumns.catColumn[1].info.name}
            </Text>
          )}
          <Tooltip.Floating label={tooltipText} disabled={!tooltipText} withinPortal>
            <svg style={{ width: '100%', height: '100%' }} ref={ref}>
              {hasAtLeast2CatCols &&
                groupedValues.map((d) => {
                  const x = xScale(d.x) + margin.left;
                  const y = yScale(d.y) + margin.top;
                  const { count } = d;
                  return (
                    <HeatmapRect
                      key={`${d.x}-${d.y}`}
                      x={x}
                      y={y}
                      width={rectWidth}
                      height={rectHeight}
                      color={colorScale(count)}
                      setTooltipText={() => setTooltipText(`${d.x} - ${d.y} (${count})`)}
                      unsetTooltipText={() => setTooltipText(null)}
                    />
                  );
                })}
              {hasAtLeast2CatCols &&
                xValues.map((xVal) => (
                  <g key={xVal} transform={`translate(${xScale(xVal) + rectWidth / 2 + margin.left}, ${height - margin.bottom + 15})`}>
                    <text color="gray" fontSize={10} transform="rotate(45)">
                      {xVal}
                    </text>
                  </g>
                ))}
              {hasAtLeast2CatCols &&
                yValues.map((yVal) => (
                  <text x={0} y={yScale(yVal) + rectHeight / 2 + margin.top} key={yVal} color="gray" fontSize={10}>
                    {yVal}
                  </text>
                ))}
            </svg>
          </Tooltip.Floating>
        </Group>
        {hasAtLeast2CatCols && (
          <Text color="dimmed" sx={{ whiteSpace: 'nowrap' }}>
            {allColumns.catColumn[0].info.name ?? ''}
          </Text>
        )}
      </>
    </Stack>
  );
}
