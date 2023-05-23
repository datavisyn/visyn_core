import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  xScale,
  yRange,
  vertPosition,
  label,
  ticks,
  showLines,
}: {
  showLines?: boolean;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
}) {
  return (
    <>
      <text dominantBaseline="center" textAnchor="middle" transform={`translate(${(xScale.range()[0] + xScale.range()[1]) / 2}, ${vertPosition + 40})`}>
        {label}
      </text>
      <path transform={`translate(0, ${vertPosition})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      <path transform={`translate(0, ${yRange[0]})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <text
            key={value}
            fontSize="10px"
            textAnchor="middle"
            style={{
              transform: 'translateY(20px)',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
