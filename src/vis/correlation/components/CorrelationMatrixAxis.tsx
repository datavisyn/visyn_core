import * as React from 'react';
import * as d3 from 'd3v7';
import { useMantineTheme } from '@mantine/core';

export function AxisTop({ xScale, ticks, height }: { xScale: d3.ScaleBand<string>; ticks: { value: string; offset: number }[]; height: number }) {
  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];

  const axisTicks = React.useMemo(() => {
    if (!xScale || !ticks) return null;

    return ticks.map(({ value, offset }) => {
      const x = xScale(value) + xScale.bandwidth() / 2;

      return (
        // <g transform={`translate(${x}, ${y})`} key={value}>
        <g key={value}>
          <line x1={x + xScale.bandwidth() / 2} x2={x + xScale.bandwidth() / 2} y2={height} stroke={borderColor} />
          {/* <text
            x={x}
            key={value}
            fontSize="10px"
            textAnchor="middle"
            style={{
              transform: 'translateY(20px)',
            }}
          >
            {value}
          </text> */}
        </g>
      );
    });
  }, [xScale, ticks, height, borderColor]);

  return axisTicks || null;
}

export function AxisLeft({ yScale, ticks, width }: { yScale: d3.ScaleBand<string>; ticks: { value: string; offset: number }[]; width: number }) {
  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];

  const axisTicks = React.useMemo(() => {
    if (!yScale || !ticks) return null;

    return ticks.map(({ value, offset }) => {
      const y = yScale(value) + yScale.bandwidth() / 2;

      return (
        // <g transform={`translate(${x}, ${y})`} key={value}>
        <g key={value}>
          <line y1={y + yScale.bandwidth() / 2} y2={y + yScale.bandwidth() / 2} x2={width} stroke={borderColor} />
          {/* <text
            y={y}
            key={value}
            fontSize="10px"
            textAnchor="middle"
            style={{
              transform: 'translateX(10px)',
            }}
          >
            {value}
          </text> */}
        </g>
      );
    });
  }, [yScale, ticks, width, borderColor]);

  return axisTicks || null;
}
