import { Group, Stack, Text } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { useEvent } from '../../hooks/useEvent';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, ESortTypes, IHeatmapConfig, VisCategoricalValue, VisNumericalValue } from '../interfaces';
import { HeatmapRect } from './HeatmapRect';
import { ColorLegend } from '../legend/ColorLegend';
import { HeatmapText } from './HeatmapText';

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
  setExternalConfig,
}: {
  column1: CatColumn;
  column2: CatColumn;
  margin: { top: number; right: number; bottom: number; left: number };
  config: IHeatmapConfig;
  isBrushEnabled: boolean;
  selectionCallback: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  setExternalConfig?: (config: IHeatmapConfig) => void;
}) {
  const [ref, { width, height }] = useResizeObserver();
  const brush = React.useRef<d3.BrushBehavior<unknown>>(null);
  const brushGElement = React.useRef<d3.Selection<SVGGElement, unknown, HTMLElement, any>>(null);
  const resetBrush = useEvent(() => (brush.current && brushGElement.current ? brush.current.clear(brushGElement.current) : null));
  const [isBrushing, setIsBrushing] = React.useState<boolean>(false);

  const aggregatedTable = useMemo(() => {
    if (!column1 || !column2) return null;

    const valueTable = table({
      xVal: column1.resolvedValues.map(({ val }) => val),
      yVal: column2.resolvedValues.map(({ val }) => val),
      id: column1.resolvedValues.map(({ id }) => id),
    });

    let idTable = valueTable
      .groupby('xVal', 'yVal')
      .rollup({ ids: op.array_agg('id'), count: op.count() })
      .impute({ count: () => 0 }, { expand: ['xVal', 'yVal'] })
      .groupby('xVal')
      .derive({ colTotal: op.sum('count') })
      .groupby('yVal')
      .derive({ rowTotal: op.sum('count') });

    if (config.sortedBy === ESortTypes.COUNT_ASC) {
      idTable = idTable.orderby('colTotal', desc('rowTotal'));
    } else {
      idTable = idTable.orderby('xVal', 'yVal');
    }

    return idTable;
  }, [column1, column2, config.sortedBy]);

  const { groupedValues, rectHeight, rectWidth, yScale, xScale, colorScale } = React.useMemo(() => {
    const groupedVals = aggregatedTable.objects() as { xVal: string; yVal: string; count: number; ids: string[] }[];

    const xSc = d3
      .scaleBand()
      .domain(groupedVals.map((gV) => gV.xVal))
      .range([0, width - margin.left - margin.right]);

    const ySc = d3
      .scaleBand()
      .domain(groupedVals.map((gV) => gV.yVal))
      .range([0, height - margin.top - margin.bottom]);

    const colorSc =
      config?.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
        ? d3
            .scaleSequential<string, string>(
              d3.piecewise(
                d3.interpolateRgb.gamma(2.2),
                ['#24528d', '#2d67a0', '#3b7bb2', '#4d90c3', '#65a5d3', '#80bae0', '#a0ceeb', '#c6e1f2', '#f1f3f5'].reverse(),
              ),
            )
            .domain([0, d3.max(groupedVals, (d) => d.count as number)])
        : config?.numColorScaleType === ENumericalColorScaleType.DIVERGENT
        ? d3
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
            .domain(d3.extent(groupedVals, (d) => d.count as number))
        : null;

    const extGroupedVals = groupedVals.map((gV) => ({
      ...gV,
      color: colorSc(gV.count),
      x: xSc(gV.xVal) + margin.left,
      y: ySc(gV.yVal) + margin.top,
    }));

    return {
      groupedValues: extGroupedVals,
      rectWidth: (width - margin.left - margin.right - interRectDistance * xSc.domain().length) / xSc.domain().length,
      rectHeight: (height - margin.bottom - margin.top - interRectDistance * ySc.domain().length) / ySc.domain().length,
      xScale: xSc,
      yScale: ySc,
      colorScale: colorSc,
    };
  }, [aggregatedTable, width, margin, height, config?.numColorScaleType]);

  React.useEffect(() => {
    selectionCallback([]);
    if (isBrushEnabled) {
      brushGElement.current = d3.select(`#heatmap-brush-${column1.info.id}-${column2.info.id}`);
      if (brushGElement) {
        brush.current = d3
          .brush()
          .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom],
          ])
          .on('brush', (e) => {
            if (e?.selection) {
              const [[x1, y1], [x2, y2]] = e.selection;
              const newSelection = [];
              groupedValues.forEach((gV) => {
                if (doOverlap({ x1: gV.x, x2: gV.x + rectWidth, y1: gV.y, y2: gV.y + rectHeight }, { x1, x2, y1, y2 })) {
                  newSelection.push(...gV.ids);
                }
              });
              selectionCallback(newSelection);
            }
          })
          .on('start', () => setIsBrushing(true))
          .on('end', () => setIsBrushing(false));
        brushGElement.current.call(brush.current);
      }
    }
  }, [
    column1.info.id,
    column2.info.id,
    groupedValues,
    height,
    isBrushEnabled,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
    rectHeight,
    rectWidth,
    selectionCallback,
    width,
  ]);

  React.useEffect(() => {
    if (!isBrushing) {
      resetBrush();
    }
  }, [resetBrush, selected, isBrushing]);

  const rects = useMemo(() => {
    return groupedValues.map((d, i) => {
      const { count, ids, x, y, xVal, yVal, color } = d;
      return (
        <HeatmapRect
          xOrder={1 - Math.floor(i / xScale.domain().length) / xScale.domain().length}
          yOrder={(i % yScale.domain().length) / yScale.domain().length}
          key={`${xVal}-${yVal}`}
          x={x}
          y={y}
          width={rectWidth}
          height={rectHeight}
          color={selected && ids?.some((id) => selected[id]) ? 'orange' : color}
          label={`${count}`}
          setSelected={() => selectionCallback(ids)}
        />
      );
    });
  }, [groupedValues, rectHeight, rectWidth, selected, selectionCallback, xScale, yScale]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }} spacing={0} align="center" justify="center">
      <Group noWrap sx={{ width: '100%', height: '100%' }} spacing={0}>
        <Text color="dimmed" sx={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', width: '50px' }}>
          {column2.info.name}
        </Text>
        <svg style={{ width: '100%', height: '100%' }} ref={ref}>
          <rect x={margin.left} y={margin.top} height={height - margin.top - margin.bottom} width={width - margin.left - margin.right} fill="#F1F3F5" />
          {rects}
          <HeatmapText height={height} width={width} margin={margin} rectHeight={rectHeight} rectWidth={rectWidth} xScale={xScale} yScale={yScale} />
          {isBrushEnabled && (
            <g
              id={`heatmap-brush-${column1.info.id}-${column2.info.id}`}
              onClick={(e) => {
                if (e.detail === 2) {
                  selectionCallback([]);
                }
              }}
            />
          )}
        </svg>
        <ColorLegend width={25} scale={colorScale} height={height - margin.top - margin.bottom} range={[...colorScale.domain()]} />
      </Group>
      <Text
        color="dimmed"
        sx={{ whiteSpace: 'nowrap' }}
        onClick={() => setExternalConfig({ ...config, sortedBy: config.sortedBy === ESortTypes.CAT_ASC ? ESortTypes.COUNT_ASC : ESortTypes.CAT_ASC })}
      >
        {column1.info.name}
      </Text>
    </Stack>
  );
}
