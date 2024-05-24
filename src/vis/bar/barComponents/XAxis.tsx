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

  React.useEffect(() => {
    setShouldRotateAxisTicks(textRef.current?.scrollWidth > textRef.current?.offsetWidth);
  }, [value, setShouldRotateAxisTicks]);

  return (
    <div
      style={{
        userSelect: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: shouldRotate ? 'calc(100% - 10px)' : '100%',
        height: shouldRotate ? '30%' : '100%',
        display: 'inline-block',
        transform: shouldRotate ? 'translate(0,100%) rotate(-45deg)' : 'none',
        transformOrigin: 'top right',
        verticalAlign: shouldRotate ? 'top' : 'middle',
        marginTop: shouldRotate ? '-30%' : 0,
        paddingLeft: shouldRotate ? '8px' : '2px',
        paddingBottom: shouldRotate ? '2px' : 0,
        float: 'right',
      }}
    >
      <Tooltip label={value} withArrow position="right">
        <Text
          ref={textRef}
          c={VIS_LABEL_COLOR}
          pb={2}
          size={compact ? rem(VIS_TICK_LABEL_SIZE_SMALL) : rem(VIS_TICK_LABEL_SIZE)}
          style={{
            userSelect: 'none',
            textOverflow: 'ellipsis',
            textAlign: shouldRotate ? 'end' : 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {value}
        </Text>
      </Tooltip>
    </div>
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
  shouldRotate = false,
  rotatedAxisLabelOffset = 0,
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
  rotatedAxisLabelOffset?: number;
}) {
  const [shouldRotateAxisTicks, setShouldRotateAxisTicks] = React.useState(shouldRotate);
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].offset - ticks[0].offset);
    }
    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);
  const w = shouldRotate ? rotatedAxisLabelOffset : tickWidth;
  return (
    <>
      {ticks.map(({ value, offset }) => (
        <g
          key={value}
          transform={`translate(${shouldRotate ? offset - w / 2 : offset}, ${vertPosition + 0})`}
          style={{
            // padding: '100% 0 0',
            // transformOrigin: 'top left',
            display: 'inline-block',
            overflow: 'hidden',
            // width: 0,
            // width: xScale.bandWidth() + 20,
            paddingTop: shouldRotateAxisTicks ? '20px' : 0,
            paddingRight: shouldRotateAxisTicks ? '20px' : 0,
            height: 20,
            width: 20,
          }}
        >
          {/* Ticks for testing - should not be shown! */}
          {/* <line y2="6" stroke="currentColor" /> */}

          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke={VIS_GRID_COLOR} /> : null}
          <foreignObject
            x={0 - w / 2}
            y={shouldRotate ? 5 : 10}
            width={w}
            height={shouldRotateAxisTicks ? rotatedAxisLabelOffset : 20}
            style={{
              textAlign: 'center',
              verticalAlign: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <TickText
              value={value}
              shouldRotate={shouldRotateAxisTicks}
              setShouldRotateAxisTicks={(v) => {
                setShouldRotateAxisTicks(shouldRotate || v);
              }}
              compact={compact}
            />
          </foreignObject>
        </g>
      ))}

      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + (shouldRotate ? rotatedAxisLabelOffset : 25)})`}>
        <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
          <Center>
            <Group gap={3} style={{ cursor: 'pointer' }}>
              <Text style={{ userSelect: 'none' }} size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} c={VIS_LABEL_COLOR}>
                {label}
              </Text>
              <Space ml="xs" />
              <SortIcon
                sortState={sortedDesc ? ESortStates.DESC : sortedAsc ? ESortStates.ASC : ESortStates.NONE}
                setSortState={(nextSort: ESortStates) => setSortType(label, nextSort)}
              />
            </Group>
          </Center>
        </foreignObject>
      </g>
    </>
  );
}
