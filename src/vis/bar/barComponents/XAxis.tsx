import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Center, Group, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { SortTypes } from '../interfaces';
import { VIS_LABEL_COLOR } from '../../constants';

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
        <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
          <Center>
            <Group gap={3} style={{ cursor: 'pointer' }}>
              {arrowDesc ? <FontAwesomeIcon style={{ color: VIS_LABEL_COLOR }} icon={faCaretLeft} /> : null}

              <Text size={compact ? rem('10px') : 'sm'} style={{ color: VIS_LABEL_COLOR }} onClick={() => setSortType(label)}>
                {label}
              </Text>
              {arrowAsc ? <FontAwesomeIcon style={{ color: VIS_LABEL_COLOR }} icon={faCaretRight} /> : null}
            </Group>
          </Center>
        </foreignObject>
      </g>

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <foreignObject x={0 - tickWidth / 2} y={10} width={tickWidth} height={20}>
            <Center>
              <Tooltip withinPortal label={value}>
                <Text
                  c={VIS_LABEL_COLOR}
                  px={2}
                  size={rem('10px')}
                  style={{ textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
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
