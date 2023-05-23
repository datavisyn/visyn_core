import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';

type IsEqual<Type1, Type2> = Type1 | Type2 extends Type1 & Type2 ? true : never;

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({
  yScale,
  xRange,
  horizontalPosition,
  label,
  ticks,
  showLines,
}: {
  yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  xRange: [number, number];
  horizontalPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  showLines?: boolean;
}) {
  return (
    <>
      <text dominantBaseline="middle" textAnchor="middle" transform={`translate(${horizontalPosition - 40}, ${yScale.range()[0] / 2}) rotate(-90)`}>
        {label}
      </text>
      <path
        transform={`translate(${horizontalPosition}, 0)`}
        d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')}
        fill="none"
        stroke="lightgray"
      />
      <path transform={`translate(${xRange[1]}, 0)`} d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${offset})`}>
          <line x2="-6" stroke="currentColor" />
          {showLines ? <line x2={`${xRange[1] - xRange[0]}`} stroke="lightgray" /> : null}
          <text
            key={value}
            style={{
              dominantBaseline: 'middle',
              fontSize: '10px',
              textAnchor: 'end',
              transform: 'translateX(-8px)',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
