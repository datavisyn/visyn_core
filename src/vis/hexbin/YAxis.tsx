import * as React from 'react';
import { useMemo } from 'react';

import { Center, Text, Tooltip, rem } from '@mantine/core';

import { VIS_GRID_COLOR, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE, VIS_TICK_LABEL_SIZE_SMALL } from '../general/constants';

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({ yScale, xRange, horizontalPosition, multiples = false }) {
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
          <line x2={`${xRange[1] - xRange[0]}`} stroke={VIS_GRID_COLOR} />
          <foreignObject x={-30} y={-4} height={tickWidth} width={35}>
            <Center>
              <Tooltip withinPortal label={value}>
                <Text
                  c={VIS_LABEL_COLOR}
                  pr="7px"
                  size={multiples ? rem(VIS_TICK_LABEL_SIZE_SMALL) : rem(VIS_TICK_LABEL_SIZE)}
                  style={{ textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {value}
                </Text>
              </Tooltip>
            </Center>
          </foreignObject>
        </g>
      ))}
    </>
  );
}
