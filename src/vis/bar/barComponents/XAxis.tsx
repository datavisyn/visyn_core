import { Center, Group, Space, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import {
  VIS_AXIS_LABEL_SIZE,
  VIS_AXIS_LABEL_SIZE_SMALL,
  VIS_GRID_COLOR,
  VIS_LABEL_COLOR,
  VIS_TICK_LABEL_SIZE,
  VIS_TICK_LABEL_SIZE_SMALL,
} from '../../general/constants';
import { ESortStates, SortIcon } from '../../general/SortIcon';
import { getLabelOrUnknown } from '../../general/utils';

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
  const [containerRef] = useResizeObserver();
  const [textRef] = useResizeObserver();

  React.useEffect(() => {
    setShouldRotateAxisTicks(textRef.current?.offsetWidth > containerRef.current?.clientWidth);
  }, [containerRef, setShouldRotateAxisTicks, textRef]);

  return (
    <Center ref={containerRef}>
      <Tooltip label={getLabelOrUnknown(value)} withArrow position="top">
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
            position: 'absolute',
            right: shouldRotate ? '-15px' : 'auto',
            width: shouldRotate ? '45px' : containerRef.current?.clientWidth,
            paddingRight: shouldRotate ? '10px' : 0,
            top: 0,
            transform: `translate(0px, 2px) rotate(${shouldRotate ? '-45deg' : '0deg'})`,
            userSelect: 'none',
          }}
        >
          {getLabelOrUnknown(value)}
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
  selectionCallback,
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
  selectionCallback?: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[], label?: string) => void;
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
          onClick={(e) => selectionCallback && selectionCallback(e, [], getLabelOrUnknown(value))}
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
            <Tooltip label={getLabelOrUnknown(label)} withArrow>
              <Text
                style={{ userSelect: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)}
                c={VIS_LABEL_COLOR}
              >
                {getLabelOrUnknown(label)}
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
