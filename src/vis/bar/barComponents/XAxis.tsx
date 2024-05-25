import { Center, Group, Space, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import {
  VIS_AXIS_LABEL_SIZE,
  VIS_AXIS_LABEL_SIZE_SMALL,
  VIS_GRID_COLOR,
  VIS_LABEL_COLOR,
  VIS_TICK_LABEL_SIZE,
  VIS_TICK_LABEL_SIZE_SMALL,
} from '../../constants';
import { ESortStates, SortIcon } from '../../general/SortIcon';

function TickText({
  value,
  shouldRotate,
  setShouldRotateAxisTicks,
  compact,
}: {
  value: string | number;
  shouldRotate: boolean;
  setShouldRotateAxisTicks?: React.Dispatch<React.SetStateAction<boolean>>;
  compact: boolean;
}) {
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const containerRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    setShouldRotateAxisTicks(textRef.current?.offsetWidth > containerRef.current?.offsetWidth);
  }, [setShouldRotateAxisTicks, containerRef, textRef]);

  return (
    <Center ref={containerRef}>
      <Tooltip label={value} withArrow position="right">
        <Text
          ref={textRef}
          c={VIS_LABEL_COLOR}
          pb={2}
          size={compact ? rem(VIS_TICK_LABEL_SIZE_SMALL) : rem(VIS_TICK_LABEL_SIZE)}
          style={{
            marginRight: shouldRotate ? '5px' : 0,
            paddingBottom: shouldRotate ? 0 : '4px',
            textAlign: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: shouldRotate ? 'absolute' : 'absolute',
            right: shouldRotate ? '-15px' : 'auto',
            width: shouldRotate ? '45px' : containerRef.current?.clientWidth,
            paddingRight: shouldRotate ? '10px' : 0,
            top: 0,
            transform: `translate(0px, 2px) rotate(${shouldRotate ? '-45deg' : '0deg'})`,
            userSelect: 'none',
          }}
        >
          {value}
        </Text>
      </Tooltip>
    </Center>
  );
}

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  xScale,
  yRange,
  vertPosition,
  label,
  ticks,
  showLines,
  compact = false,
  sortedAsc = false,
  sortedDesc = false,
  setSortType,
  shouldRotate,
}: {
  showLines?: boolean;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  compact?: boolean;
  sortedAsc?: boolean;
  sortedDesc?: boolean;
  setSortType: (label: string, nextSortState: ESortStates) => void;
  shouldRotate?: boolean;
}) {
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[0].offset - ticks[1].offset);
    }
    return xScale.range()[1] - xScale.range()[0];
  }, [ticks, xScale]);

  const [shouldRotateAxisTicks, setShouldRotateAxisTicks] = React.useState(shouldRotate);

  return (
    <>
      {ticks.map(({ value, offset }) => (
        <g
          key={value}
          transform={`translate(${offset}, ${vertPosition + 0})`}
          style={{
            display: 'inline-block',
            overflow: shouldRotateAxisTicks ? 'visible' : 'hidden',
            paddingTop: shouldRotateAxisTicks ? '20px' : 0,
            paddingRight: shouldRotateAxisTicks ? '20px' : 0,
            height: 120,
          }}
        >
          {/* Ticks for testing - should not be shown! */}
          {/* <line y2="6" stroke="currentColor" /> */}

          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke={VIS_GRID_COLOR} /> : null}
          <foreignObject
            x={0 - tickWidth / 2}
            y={10}
            width={tickWidth}
            height={shouldRotateAxisTicks ? 150 : 40}
            style={{
              textAlign: 'center',
              verticalAlign: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              paddingRight: '6px',
              overflow: 'inherit',
            }}
          >
            <TickText
              value={value}
              compact={compact}
              shouldRotate={shouldRotateAxisTicks}
              setShouldRotateAxisTicks={(v) => {
                setShouldRotateAxisTicks(shouldRotate || v);
              }}
            />
          </foreignObject>
        </g>
      ))}

      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + 35})`}>
        <foreignObject width={Math.abs(xScale.range()[1] - xScale.range()[0])} height={60}>
          <Group justify="center" gap={3} w="100%" wrap="nowrap">
            <Tooltip label={label} withArrow>
              <Text
                style={{ userSelect: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)}
                c={VIS_LABEL_COLOR}
              >
                {label}
              </Text>
            </Tooltip>
            <Space ml="xs" />
            <SortIcon
              sortState={sortedDesc ? ESortStates.DESC : sortedAsc ? ESortStates.ASC : ESortStates.NONE}
              setSortState={(nextSort: ESortStates) => setSortType(label, nextSort)}
            />
          </Group>
        </foreignObject>
      </g>
    </>
  );
}
