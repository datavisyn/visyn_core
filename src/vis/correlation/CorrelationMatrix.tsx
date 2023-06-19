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

interface CircleProps {
  cx: number;
  cy: number;
  correlation: number;
  xname: string;
  yname: string;
}

function SCircle({ value, fill, xScale, yScale, hover }: { value: CircleProps; fill: string; xScale; yScale; hover: boolean }) {
  const cx = xScale(value.xname) + xScale.bandwidth() / 2;
  const cy = yScale(value.yname) + yScale.bandwidth() / 2;

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={Math.min(xScale.bandwidth() / 2 - 16, yScale.bandwidth() / 2 - 16)}
        fill={fill}
        {...(hover ? { stroke: 'black', strokeWidth: 3 } : {})}
      />
      <text
        x={xScale(value.yname) + xScale.bandwidth() / 2}
        y={yScale(value.xname) + yScale.bandwidth() / 2}
        fontSize={24}
        dominantBaseline="middle"
        textAnchor="middle"
        fontWeight={hover ? 'bold' : 'initial'}
      >
        {value.correlation.toFixed(2)}
      </text>
    </>
  );
}

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
  const borderColor = theme.colors.gray[4];

  const [hover, setHover] = React.useState<{ xi: number; yi: number }>(undefined);

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

    const circles = [] as CircleProps[];
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
          circles.push({ cx: i, cy: j, correlation, xname: column.info.name, yname: column2.info.name });
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
        <svg
          style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}
          onMouseMove={(event) => {
            console.log(event.nativeEvent.offsetX, event.nativeEvent.offsetY);

            const xi = Math.floor(event.nativeEvent.offsetX / (width / data.value.numericalColumns.length));
            const yi = Math.floor(event.nativeEvent.offsetY / (height / data.value.numericalColumns.length));

            setHover({ xi, yi });
          }}
          onMouseLeave={() => {
            setHover(undefined);
          }}
        >
          {data.value?.numericalColumns.map((column) => {
            return (
              <>
                <line x1={xScale(column.info.name) + 0.5} y1={0} x2={xScale(column.info.name) + 0.5} y2={height} stroke={borderColor} />
                <line x1={0} y1={yScale(column.info.name) + 0.5} x2={width} y2={yScale(column.info.name) + 0.5} stroke={borderColor} />
              </>
            );
          })}

          <line x1={width - 0.5} y1={0} x2={width - 0.5} y2={height} stroke={borderColor} />
          <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} stroke={borderColor} />

          {memoized?.circle.map((value) => {
            return (
              <SCircle
                hover={(value.cx === hover?.xi && value.cy === hover?.yi) || (value.cx === hover?.yi && value.cy === hover?.xi)}
                fill={colorScale(value.correlation)}
                value={value}
                xScale={xScale}
                yScale={yScale}
              />
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
