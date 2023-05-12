import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({ xScale, yRange, vertPosition }: { xScale: d3.ScaleBand<string>; yRange: [number, number]; vertPosition: number }) {
  const ticks = useMemo(() => {
    return xScale.domain().map((value) => ({
      value,
      xOffset: xScale(value) + xScale.bandwidth() / 2,
    }));
  }, [xScale]);

  return (
    <>
      <path transform={`translate(0, ${vertPosition})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      <path transform={`translate(0, ${yRange[0]})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />

      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" />
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
