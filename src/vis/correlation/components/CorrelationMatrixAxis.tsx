import * as React from 'react';
import * as d3 from 'd3v7';
import { useMantineTheme } from '@mantine/core';

export function Ticks() {
  return <div></div>;
}

export function Grid({ width, height, cells }: { width: number; height: number; cells: number }) {
  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];

  return (
    <>
      {Array.from({ length: cells + 1 }).map((_, i) => {
        const x = (width / cells) * i;
        const y = (height / cells) * i;

        return (
          <g key={x}>
            <line x1={x} x2={x} y1={0} y2={height} stroke={borderColor} />
            <line x1={0} x2={width} y1={y} y2={y} stroke={borderColor} />
          </g>
        );
      })}
    </>
  );
}

export function AxisTop({ xScale, ticks, height }: { xScale: d3.ScaleBand<string>; ticks: { value: string; offset: number }[]; height: number }) {
  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];
  if (!xScale || !ticks) return null;

  return (
    <>
      {ticks.map(({ value, offset }) => {
        const x = xScale(value);

        return (
          <g key={value}>
            <line x1={x} x2={x} y2={height} stroke={borderColor} />
          </g>
        );
      })}
    </>
  );
}

export function AxisLeft({ yScale, ticks, width }: { yScale: d3.ScaleBand<string>; ticks: { value: string; offset: number }[]; width: number }) {
  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];

  if (!yScale || !ticks) return null;

  return (
    <>
      {ticks.map(({ value, offset }) => {
        const y = yScale(value) + yScale.bandwidth() / 2;

        return (
          <g key={value}>
            <line y1={y + yScale.bandwidth() / 2} y2={y + yScale.bandwidth() / 2} x2={width} stroke={borderColor} />
          </g>
        );
      })}
    </>
  );
}
