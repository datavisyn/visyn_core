import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Center, Group, Text, Tooltip } from '@mantine/core';
import { SortTypes } from '../utils';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  xScale,
  yRange,
  vertPosition,
  label,
  ticks,
  showLines,
  compact = false,
  sortType,
  arrowAsc = false,
  arrowDesc = false,
  setSortType,
}: {
  showLines?: boolean;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  compact?: boolean;
  sortType: SortTypes;
  arrowAsc?: boolean;
  arrowDesc?: boolean;
  setSortType: (label: string) => void;
}) {
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].offset - ticks[0].offset);
    }

    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);
  return (
    <>
      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + 25})`}>
        <foreignObject width={xScale.range()[0] - xScale.range()[1]} height={20}>
          <Center>
            <Group spacing={3}>
              {arrowDesc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretLeft} /> : null}

              <Text size={compact ? 10 : 14} style={{ color: '#878E95' }} onClick={() => setSortType(label)}>
                {label}
              </Text>
              {arrowAsc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretRight} /> : null}
            </Group>
          </Center>
        </foreignObject>
      </g>
      <path transform={`translate(0, ${vertPosition})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      <path transform={`translate(0, ${yRange[0]})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <foreignObject x={0 - tickWidth / 2} y={10} width={tickWidth} height={20}>
            <Center>
              <Tooltip withinPortal label={value}>
                <Text px={2} size={10} style={{ textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
