import { Tooltip, rem, Text } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({ yScale, xRange, horizontalPosition }) {
  const ticks = useMemo(() => {
    return yScale.ticks(5).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].yOffset - ticks[0].yOffset);
    }
    return yScale.range()[0] - yScale.range()[1];
  }, [ticks, yScale]);

  return (
    <>
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${yOffset})`}>
          <line x2={`${xRange[1] - xRange[0]}`} stroke="#E9ECEF" />
          <foreignObject x={-20} y={-4} height={tickWidth} width={20}>
            <Tooltip withinPortal label={value}>
              <Text c="gray.6" px={2} size={rem('10px')} style={{ textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {value}
              </Text>
            </Tooltip>
          </foreignObject>
        </g>
      ))}
    </>
  );
}
