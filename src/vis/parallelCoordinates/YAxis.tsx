import * as React from 'react';
import { useMemo } from 'react';
import { Tooltip } from '@mantine/core';
import { EColumnTypes, IParallelCoordinatesConfig, VisColumn } from '../interfaces';
// code taken from https://wattenberger.com/blog/react-and-d3
export function ParallelYAxis({ yScale, xRange, horizontalPosition, type, axisLabel }) {
  const ticks = useMemo(() => {
    if (type === EColumnTypes.NUMERICAL) {
      return yScale.ticks(5).map((value) => ({
        value,
        yOffset: yScale(value),
      }));
    }
    return yScale.domain().map((value) => ({
      value,
      // if we have a categorical column, we want to center the label
      yOffset: yScale(value) + yScale.bandwidth() / 2,
    }));
  }, [type, yScale]);

  const labelYOffset = 7; // offset for vertical position
  const labelXOffset = 40; // magic number to center label horizontally
  return (
    <>
      <Tooltip position="bottom" offset={15} withinPortal multiline label={axisLabel} color="dark">
        <text x={horizontalPosition - labelXOffset} y={yScale.range()[1] - labelYOffset}>
          {axisLabel}
        </text>
      </Tooltip>
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
          <Tooltip withinPortal label="test">
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
          </Tooltip>
        </g>
      ))}
    </>
  );
}
