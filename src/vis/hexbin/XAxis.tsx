import { Tooltip, rem, Text, Center } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';
import { VIS_GRID_COLOR, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE, VIS_TICK_LABEL_SIZE_SMALL } from '../general/constants';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({ xScale, yRange, vertPosition, multiples = false }) {
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
          {yRange ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke={VIS_GRID_COLOR} /> : null}

          <foreignObject y={8} x={-tickWidth / 2} width={tickWidth} height={20}>
            <Center>
              <Tooltip label={value}>
                <Text
                  data-testid="HexplotXAxis"
                  c={VIS_LABEL_COLOR}
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
