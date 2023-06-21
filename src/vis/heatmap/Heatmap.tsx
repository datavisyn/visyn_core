import { Group, Stack, Switch, Text, Tooltip } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { op, table } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, IHeatmapConfig, VisCategoricalValue, VisNumericalValue } from '../interfaces';
import { HeatmapRect } from './HeatmapRect';
import { useEvent } from '../../hooks/useEvent';

const interRectDistance = 1;

type CatColumn = {
  resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
  type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
  info: ColumnInfo;
};

function doOverlap(rect1: { x1: number; x2: number; y1: number; y2: number }, rect2: { x1: number; x2: number; y1: number; y2: number }) {
  // if rectangle has area 0, no overlap
  if (rect1.x1 === rect1.x2 || rect1.y1 === rect1.y2 || rect2.x1 === rect2.x2 || rect2.y1 === rect2.y2) {
    return false;
  }
  // If one rectangle is on left side of other
  if (rect1.x1 > rect2.x2 || rect2.x1 > rect1.x2) {
    return false;
  }
  // If one rectangle is above other
  if (rect1.y1 > rect2.y2 || rect2.y1 > rect1.y2) {
    return false;
  }
  return true;
}

export function Heatmap({
  column1,
  column2,
  margin,
  config,
  isBrushEnabled,
  selected,
  selectionCallback,
}: {
  column1: CatColumn;
  column2: CatColumn;
  margin: { top: number; right: number; bottom: number; left: number };
  config: IHeatmapConfig;
  isBrushEnabled: boolean;
  selectionCallback: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
}) {
  const [ref, { width, height }] = useResizeObserver();
  const [tooltipText, setTooltipText] = React.useState<string | null>(null);
  const brush = React.useRef<d3.BrushBehavior<unknown>>(null);
  const brushGElement = React.useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>(null);
  const resetBrush = useEvent(() => (brush.current && brushGElement.current ? brush.current.clear(brushGElement.current) : null));

  const { xValues, yValues, groupedValues, rectHeight, rectWidth, yScale, xScale, colorScale } = React.useMemo(() => {
    const xVals = [...new Set(column1?.resolvedValues.map(({ val }) => val))] as string[];
    const yVals = [...new Set(column2?.resolvedValues.map(({ val }) => val))] as string[];

    const xSc = d3
      .scaleBand()
      .domain(xVals)
      .range([0, width - margin.left - margin.right]);

    const ySc = d3
      .scaleBand()
      .domain(yVals)
      .range([0, height - margin.top - margin.bottom]);

    const valueTable = table({
      xVal: column1?.resolvedValues.map(({ val }) => val),
      yVal: column2?.resolvedValues.map(({ val }) => val),
      id: column1?.resolvedValues.map(({ id }) => id),
    });

    const countTable = valueTable
      .groupby('xVal', 'yVal')
      .count()
      .impute({ count: () => 0 }, { expand: ['xVal', 'yVal'] });
    const idTable = valueTable.groupby('xVal', 'yVal').rollup({ ids: op.array_agg('id') });

    const groupedVals = countTable.join(idTable).objects() as { xVal: string; yVal: string; count: number; ids: string[] }[];

    const colorSc =
      config?.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
        ? d3.scaleSequential<string, string>(d3.interpolateBlues).domain(d3.extent(groupedVals, (d) => d.count as number))
        : config?.numColorScaleType === ENumericalColorScaleType.DIVERGENT
        ? d3.scaleDiverging<string, string>(d3.interpolatePiYG).domain(d3.extent(groupedVals, (d) => d.count as number))
        : null;

    const extGroupedVals = groupedVals.map((gV) => ({
      ...gV,
      color: colorSc(gV.count),
      x: xSc(gV.xVal) + margin.left,
      y: ySc(gV.yVal) + margin.top,
    }));

    return {
      xValues: xVals,
      yValues: yVals,
      groupedValues: extGroupedVals,
      rectWidth: (width - margin.left - margin.right - interRectDistance * xVals.length) / xVals.length,
      rectHeight: (height - margin.bottom - margin.top - interRectDistance * yVals.length) / yVals.length,
      xScale: xSc,
      yScale: ySc,
      colorScale: colorSc,
    };
  }, [column1?.resolvedValues, column2?.resolvedValues, height, margin, width, config]);

  React.useEffect(() => {
    selectionCallback([]);
    // resetBrush(); TODO:
    if (isBrushEnabled) {
      brushGElement.current = d3.select('#heatmap-brush');
      if (brushGElement) {
        brush.current = d3
          .brush()
          .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom],
          ])
          .on('brush', (a) => {
            const [[x1, y1], [x2, y2]] = a.selection;
            const newSelection = [];
            groupedValues.forEach((gV) => {
              if (doOverlap({ x1: gV.x, x2: gV.x + rectWidth, y1: gV.y, y2: gV.y + rectHeight }, { x1, x2, y1, y2 })) {
                newSelection.push(...gV.ids);
              }
            });
            selectionCallback(newSelection);
          });
        brushGElement.current.call(brush.current);
      }
    }
  }, [
    groupedValues,
    height,
    isBrushEnabled,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    rectHeight,
    rectWidth,
    resetBrush,
    selectionCallback,
    width,
  ]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }} spacing={0} align="center" justify="center">
      <Group noWrap sx={{ width: '100%', height: '100%' }} spacing={0}>
        <Text color="dimmed" sx={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
          {column2.info.name}
        </Text>
        <Tooltip.Floating label={tooltipText} disabled={!tooltipText} withinPortal>
          <svg style={{ width: '100%', height: '100%' }} ref={ref}>
            {groupedValues.map((d) => {
              const { count, ids, x, y, xVal, yVal, color } = d;
              return (
                <HeatmapRect
                  key={`${xVal}-${yVal}`}
                  x={x}
                  y={y}
                  width={rectWidth}
                  height={rectHeight}
                  color={selected && ids.some((id) => selected[id]) ? 'orange' : color}
                  setTooltipText={() => setTooltipText(`${xVal} - ${yVal} (${count})`)}
                  unsetTooltipText={() => setTooltipText(null)}
                  setSelected={() => selectionCallback(ids)}
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
            {isBrushEnabled && (
              <g
                id="heatmap-brush"
                onClick={(event) => {
                  if (event.detail === 2) {
                    selectionCallback([]);
                    resetBrush();
                  }
                }}
              />
            )}
          </svg>
        </Tooltip.Floating>
      </Group>
      <Text color="dimmed" sx={{ whiteSpace: 'nowrap' }}>
        {column1.info.name}
      </Text>
    </Stack>
  );
}
