import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { table } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../interfaces';

import { useAsync } from '../../hooks';
import { ENumericalColorScaleType, IHeatmapConfig, VisColumn } from '../interfaces';
import { HeatmapRect } from './HeatmapRect';

const interRectDistance = 1;

type CatColumn = {
  resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
  type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
  info: ColumnInfo;
};

export function Heatmap({
  column1,
  column2,
  margin,
  config,
}: {
  column1: CatColumn;
  column2: CatColumn;
  margin: { top: number; right: number; bottom: number; left: number };
  config: IHeatmapConfig;
}) {
  const [ref, { width, height }] = useResizeObserver();
  const [tooltipText, setTooltipText] = React.useState<string | null>(null);

  const { xValues, yValues, groupedValues, rectHeight, rectWidth, yScale, xScale, colorScale } = React.useMemo(() => {
    const myTable = table({
      x: column1?.resolvedValues.map(({ val }) => val),
      y: column2?.resolvedValues.map(({ val }) => val),
    });
    const xVals = [...new Set(column1?.resolvedValues.map(({ val }) => val))] as string[];
    const yVals = [...new Set(column2?.resolvedValues.map(({ val }) => val))] as string[];

    const gropuedVals = myTable
      .groupby('x', 'y')
      .count()
      .impute({ count: () => 0 }, { expand: ['x', 'y'] })
      .objects() as { x: string; y: string; count: number }[];

    return {
      xValues: xVals,
      yValues: yVals,
      groupedValues: gropuedVals,
      rectWidth: (width - margin.left - margin.right - interRectDistance * xVals.length) / xVals.length,
      rectHeight: (height - margin.bottom - margin.top - interRectDistance * yVals.length) / yVals.length,
      xScale: d3
        .scaleBand()
        .domain(xVals)
        .range([0, width - margin.left - margin.right]),
      yScale: d3
        .scaleBand()
        .domain(yVals)
        .range([0, height - margin.top - margin.bottom]),
      colorScale:
        config?.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
          ? d3.scaleSequential<string, string>(d3.interpolateBlues).domain(d3.extent(gropuedVals, (d) => d.count as number))
          : config?.numColorScaleType === ENumericalColorScaleType.DIVERGENT
          ? d3.scaleDiverging<string, string>(d3.interpolatePiYG).domain(d3.extent(gropuedVals, (d) => d.count as number))
          : null,
    };
  }, [column1?.resolvedValues, column2?.resolvedValues, height, margin, width, config]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }} spacing={0} align="center" justify="center">
      <Group noWrap sx={{ width: '100%', height: '100%' }} spacing={0}>
        <Text color="dimmed" sx={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
          {column2.info.name}
        </Text>
        <Tooltip.Floating label={tooltipText} disabled={!tooltipText} withinPortal>
          <svg style={{ width: '100%', height: '100%' }} ref={ref}>
            {groupedValues.map((d) => {
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
            {xValues.map((xVal) => (
              <g key={xVal} transform={`translate(${xScale(xVal) + rectWidth / 2 + margin.left}, ${height - margin.bottom + 15})`}>
                <text color="gray" fontSize={10} transform="rotate(45)">
                  {xVal}
                </text>
              </g>
            ))}
            {yValues.map((yVal) => (
              <text x={0} y={yScale(yVal) + rectHeight / 2 + margin.top} key={yVal} color="gray" fontSize={10}>
                {yVal}
              </text>
            ))}
          </svg>
        </Tooltip.Floating>
      </Group>
      <Text color="dimmed" sx={{ whiteSpace: 'nowrap' }}>
        {column1.info.name}
      </Text>
    </Stack>
  );
}
