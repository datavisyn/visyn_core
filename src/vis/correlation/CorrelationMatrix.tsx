import * as React from 'react';
import { scaleBand, scaleLinear, scalePoint } from 'd3v7';
import { Group, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as calculateCorrelation from 'calculate-correlation';
import { ICorrelationConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { InvalidCols } from '../general/InvalidCols';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { CorrelationVisSidebar } from './CorrelationVisSidebar';
import { useAsync } from '../../hooks/useAsync';
import { getScatterData } from './utils';

export function CorrelationMatrix({
  config,
  columns,
  setConfig,
  enableSidebar,
  showSidebar,
  setShowSidebar,
  extensions,
}: {
  config: ICorrelationConfig;
  columns: VisColumn[];
  setConfig?: (config: IVisConfig) => void;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
}) {
  const color = scaleLinear().domain([-1, 0, 1]).range(['#B22222', '#fff', '#000080']);
  const data = useAsync(getScatterData, [columns, config.numColumnsSelected]);

  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[7];

  const [ref, { width, height }] = useResizeObserver<HTMLDivElement>();

  const xScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    return scaleBand()
      .range([0, width])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [width, data]);

  const yScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    return scaleBand()
      .range([0, height])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [height, data]);

  const memoized = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    const circles = [] as { cx: number; cy: number; correlation: number }[];
    const texts = [] as { cx: number; cy: number; correlation: number }[];

    data.value.numericalColumns.forEach((column, i) => {
      const xname = column.info.name;

      data.value.numericalColumns.forEach((column2, j) => {
        const yname = column2.info.name;

        const correlation = calculateCorrelation(
          column.resolvedValues.map((resolved) => resolved.val as number),
          column2.resolvedValues.map((resolved) => resolved.val as number),
        );

        if (i > j) {
          circles.push({ cx: xScale(xname) + xScale.bandwidth() / 2, cy: yScale(yname) + yScale.bandwidth() / 2, correlation });
        }
        if (j > i) {
          texts.push({ cx: xScale(xname) + xScale.bandwidth() / 2, cy: yScale(yname) + yScale.bandwidth() / 2, correlation });
        }
      });
    });

    return { circle: circles, text: texts };
  }, [xScale, yScale, data]);

  const colorScale = scaleLinear().domain([-1, 0, 1]).range(['#B22222', '#fff', '#000080']);

  return (
    <Group
      noWrap
      pl={0}
      pr={0}
      spacing={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        // Disable plotly crosshair cursor
        '.nsewdrag': {
          cursor: 'pointer !important',
        },
      }}
    >
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack
        spacing={0}
        ref={ref}
        sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}>
          {data.value?.numericalColumns.map((column) => {
            return (
              <>
                <line x1={xScale(column.info.name) + 0.5} y1={0} x2={xScale(column.info.name) + 0.5} y2={height} stroke={'red'} />
                <line x1={0} y1={yScale(column.info.name) + 0.5} x2={width} y2={yScale(column.info.name) + 0.5} stroke={'red'} />
              </>
            );
          })}

          <line x1={width - 0.5} y1={0} x2={width - 0.5} y2={height} stroke={'red'} />
          <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} stroke={'red'} />

          {memoized?.circle.map((value) => {
            return <circle cx={value.cx} cy={value.cy} r={50} fill={colorScale(value.correlation)} />;
          })}

          {memoized?.text.map((value) => {
            return (
              <text x={value.cx} y={value.cy}>
                {value.correlation.toFixed(2)}
              </text>
            );
          })}
        </svg>
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <CorrelationVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
