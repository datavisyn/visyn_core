import { faArrowDownShortWide, faArrowDownWideShort, faArrowDownAZ, faArrowDownZA } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Container, Group, Stack, Text } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { rollupByAggregateType } from '../bar/utils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ENumericalColorScaleType, VisCategoricalValue, VisNumericalValue } from '../interfaces';
import { ColorLegendVert } from '../legend/ColorLegendVert';
import { HeatmapRect } from './HeatmapRect';
import { HeatmapText } from './HeatmapText';
import { ESortTypes, IHeatmapConfig } from './interfaces';
import { sequentialBlueColors } from '../../utils/colors';

const interRectDistance = 1;

type CatColumn = {
  resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
  type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
  info: ColumnInfo;
};

export function Heatmap({
  column1,
  column2,
  aggregateColumn,
  margin,
  config,
  selected,
  selectionCallback,
  setExternalConfig,
}: {
  column1: CatColumn;
  column2: CatColumn;
  aggregateColumn: CatColumn;
  margin: { top: number; right: number; bottom: number; left: number };
  config: IHeatmapConfig;
  selectionCallback: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  setExternalConfig?: (config: IHeatmapConfig) => void;
}) {
  const [ref, { width, height }] = useResizeObserver();

  const baseTable = useMemo(() => {
    if (!column1 || !column2) return null;

    return table({
      xVal: column1.resolvedValues.map(({ val }) => val),
      yVal: column2.resolvedValues.map(({ val }) => val),
      aggregateVal: aggregateColumn?.resolvedValues.map(({ val }) => val) || [],
      id: column1.resolvedValues.map(({ id }) => id),
    });
  }, [aggregateColumn?.resolvedValues, column1, column2]);
  const aggregatedTable = useMemo(() => {
    if (!baseTable) return null;

    let valueTable = rollupByAggregateType(baseTable.groupby('xVal', 'yVal'), config.aggregateType);

    if (config.aggregateType === EAggregateTypes.COUNT) {
      valueTable = valueTable.impute({ aggregateVal: () => 0 }, { expand: ['xVal', 'yVal'] });
    } else {
      valueTable = valueTable.impute({ aggregateVal: () => null }, { expand: ['xVal', 'yVal'] });
    }

    valueTable = valueTable
      .groupby('xVal')
      .derive({ colTotal: op.sum('aggregateVal') })
      .groupby('yVal')
      .derive({ rowTotal: op.sum('aggregateVal') });

    // default is ESortTypes.CAT_ASC
    let xOrder: string | object;
    switch (config.xSortedBy) {
      case ESortTypes.VAL_ASC:
        xOrder = 'colTotal';
        break;
      case ESortTypes.CAT_DESC:
        xOrder = desc('xVal');
        break;
      case ESortTypes.VAL_DESC:
        xOrder = desc('colTotal');
        break;
      default:
        xOrder = 'xVal';
        break;
    }

    // default is ESortTypes.CAT_ASC
    let yOrder: string | object;
    switch (config.ySortedBy) {
      case ESortTypes.VAL_ASC:
        yOrder = 'rowTotal';
        break;
      case ESortTypes.CAT_DESC:
        yOrder = desc('yVal');
        break;
      case ESortTypes.VAL_DESC:
        yOrder = desc('rowTotal');
        break;
      default:
        yOrder = 'yVal';
        break;
    }
    valueTable = valueTable.orderby(xOrder, yOrder);

    return valueTable;
  }, [baseTable, config.aggregateType, config.xSortedBy, config.ySortedBy]);

  const { groupedValues, rectHeight, rectWidth, yScale, xScale, colorScale } = React.useMemo(() => {
    const groupedVals = aggregatedTable.objects() as { xVal: string; yVal: string; aggregateVal: number; ids: string[] }[];

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
            .scaleSequential<string, string>(d3.piecewise(d3.interpolateRgb.gamma(2.2), sequentialBlueColors))
            .domain(
              config.aggregateType === EAggregateTypes.COUNT
                ? [0, d3.max(groupedVals, (d) => d.aggregateVal as number)]
                : d3.extent(groupedVals, (d) => d.aggregateVal as number),
            )
        : config?.numColorScaleType === ENumericalColorScaleType.DIVERGENT
          ? d3
              .scaleSequential<
                string,
                string
              >(d3.piecewise(d3.interpolateRgb.gamma(2.2), ['#003367', '#16518a', '#2e72ae', '#5093cd', '#77b5ea', '#aad7fd', '#F1F3F5', '#fac7a9', '#f99761', '#e06d3b', '#c2451a', '#99230d', '#6f0000'].reverse()))
              .domain(d3.extent(groupedVals, (d) => d.aggregateVal as number))
          : null;

    const extGroupedVals = groupedVals.map((gV) => ({
      ...gV,
      color: gV.aggregateVal === null ? 'white' : colorSc(gV.aggregateVal),
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
  }, [aggregatedTable, width, margin.left, margin.right, margin.top, margin.bottom, height, config?.numColorScaleType, config.aggregateType]);

  const rects = useMemo(() => {
    if (width === 0 || height === 0) return null;
    return groupedValues.map((d, i) => {
      const { aggregateVal, x, y, xVal, yVal, color } = d;
      const ids: string[] = Array.from(
        baseTable
          .params({ x: xVal, y: yVal })
          .filter((b, $) => b.xVal === $.x && b.yVal === $.y)
          .values('id'),
      );
      return (
        <HeatmapRect
          xOrder={1 - Math.floor(i / xScale.domain().length) / xScale.domain().length}
          yOrder={(i % yScale.domain().length) / yScale.domain().length}
          key={`${xVal}-${yVal}`}
          x={x}
          y={y}
          isSelected={selected && ids?.some((id) => selected[id])}
          width={rectWidth}
          height={rectHeight}
          color={color}
          label={aggregateVal}
          setSelected={() => selectionCallback(ids)}
          isImmediate={!config.isAnimationEnabled}
        />
      );
    });
  }, [baseTable, groupedValues, height, rectHeight, rectWidth, selected, selectionCallback, width, xScale, yScale, config.isAnimationEnabled]);

  const text = useMemo(() => {
    if (width === 0 || height === 0) return null;
    return (
      <HeatmapText
        height={height}
        width={width}
        margin={margin}
        rectHeight={rectHeight}
        rectWidth={rectWidth}
        xScale={xScale}
        yScale={yScale}
        isImmediate={!config.isAnimationEnabled}
      />
    );
  }, [height, margin, rectHeight, rectWidth, width, xScale, yScale, config.isAnimationEnabled]);

  return (
    <Stack style={{ width: '100%', height: '100%' }} gap={0} align="center" justify="center">
      <Box pl={20}>
        <ColorLegendVert
          width={width - margin.left - margin.right}
          scale={colorScale}
          height={20}
          range={[...colorScale.domain()]}
          title={`${config.aggregateType} ${config.aggregateType === EAggregateTypes.COUNT ? '' : config.aggregateColumn.name}`}
        />
      </Box>
      <Group wrap="nowrap" style={{ width: '100%', height: '100%' }} gap={0} pr="40px">
        <Text
          color="dimmed"
          style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', width: '40px', cursor: 'pointer' }}
          onClick={() =>
            setExternalConfig({
              ...config,
              ySortedBy:
                config.ySortedBy === ESortTypes.CAT_ASC
                  ? ESortTypes.CAT_DESC
                  : config.ySortedBy === ESortTypes.CAT_DESC
                    ? ESortTypes.VAL_ASC
                    : config.ySortedBy === ESortTypes.VAL_ASC
                      ? ESortTypes.VAL_DESC
                      : ESortTypes.CAT_ASC,
            })
          }
        >
          <FontAwesomeIcon
            fontWeight={100}
            color="#C0C0C0"
            style={{ marginRight: '10px', fontWeight: 200 }}
            icon={
              config.ySortedBy === ESortTypes.VAL_ASC
                ? faArrowDownShortWide
                : config.ySortedBy === ESortTypes.VAL_DESC
                  ? faArrowDownWideShort
                  : config.ySortedBy === ESortTypes.CAT_ASC
                    ? faArrowDownAZ
                    : faArrowDownZA
            }
          />
          {column2.info.name}
        </Text>
        <Box ref={ref} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Container
            fluid
            pl={0}
            pr={0}
            style={{
              height,
              width: '100%',
            }}
          >
            <svg height={height} width={width}>
              <rect x={margin.left} y={margin.top} height={height - margin.top - margin.bottom} width={width - margin.left - margin.right} fill="#F1F3F5" />
              {rects}
              {text}
            </svg>
          </Container>
        </Box>
      </Group>
      <Text
        color="dimmed"
        style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
        onClick={() =>
          setExternalConfig({
            ...config,
            xSortedBy:
              config.xSortedBy === ESortTypes.CAT_ASC
                ? ESortTypes.CAT_DESC
                : config.xSortedBy === ESortTypes.CAT_DESC
                  ? ESortTypes.VAL_ASC
                  : config.xSortedBy === ESortTypes.VAL_ASC
                    ? ESortTypes.VAL_DESC
                    : ESortTypes.CAT_ASC,
          })
        }
      >
        <FontAwesomeIcon
          color="#C0C0C0"
          style={{ marginRight: '10px' }}
          icon={
            config.xSortedBy === ESortTypes.VAL_ASC
              ? faArrowDownShortWide
              : config.xSortedBy === ESortTypes.VAL_DESC
                ? faArrowDownWideShort
                : config.xSortedBy === ESortTypes.CAT_ASC
                  ? faArrowDownAZ
                  : faArrowDownZA
          }
        />
        {column1.info.name}
      </Text>
    </Stack>
  );
}
