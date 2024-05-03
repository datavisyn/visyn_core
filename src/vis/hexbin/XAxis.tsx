import { Tooltip, rem, Text } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({ xScale, yRange, vertPosition }) {
  const ticks = useMemo(() => {
    return xScale.ticks(5).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);

  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].xOffset - ticks[0].xOffset);
    }
    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);

  return (
    <>
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, ${vertPosition})`}>
          {yRange ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="#E9ECEF" /> : null}

          <foreignObject y={10} x={-4} width={tickWidth} height={20}>
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
