import * as React from 'react';
import { useMemo } from 'react';
import { EColumnTypes, IParallelCoordinatesConfig, VisColumn } from '../interfaces';
// code taken from https://wattenberger.com/blog/react-and-d3
export function ParallelYAxis({ yScale, xRange, horizontalPosition, type }) {
  console.log(yScale);
  const ticks = useMemo(() => {
    if (type === EColumnTypes.NUMERICAL) {
      return yScale.ticks(5).map((value) => ({
        value,
        yOffset: yScale(value),
      }));
    }
    return yScale.domain().map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [type, yScale]);

  return (
    <>
      <path
        transform={`translate(${horizontalPosition}, 0)`}
        d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')}
        fill="none"
        stroke="lightgray"
      />
      <path transform={`translate(${xRange[1]}, 0)`} d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${yOffset})`}>
          <line x2="-6" stroke="currentColor" />
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
