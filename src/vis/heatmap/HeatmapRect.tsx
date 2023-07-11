import { Tooltip } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, animated, easings } from 'react-spring';

const DELAY = 2000;
export function HeatmapRect({
  x,
  y,
  width,
  height,
  color,
  label,
  setSelected,
  xOrder = 1,
  yOrder = 1,
  isSelected = false,
  onClick = () => null,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: number;
  setSelected?: () => void;
  xOrder?: number;
  yOrder?: number;
  isSelected?: boolean;
  onClick?: (e: any) => void;
}) {
  const [isHovered, setIsHovered] = useState<boolean>();
  const currXOrder = useRef(xOrder);
  const currYOrder = useRef(yOrder);

  const isImmediate = currXOrder.current === xOrder && currYOrder.current === yOrder;

  const colorSpring = useSpring({ fill: color, config: { duration: 750, easing: easings.easeInOutSine } });

  const xSpring = useSpring({
    x,
    config: { duration: DELAY, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : DELAY * xOrder,
    immediate: isImmediate,
  });
  const ySpring = useSpring({
    y,
    config: { duration: DELAY, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : DELAY * yOrder,
    immediate: isImmediate,
  });

  const rect = useMemo(() => {
    return (
      <animated.rect
        {...colorSpring}
        {...xSpring}
        {...ySpring}
        width={width}
        stroke={isSelected ? 'orange' : 'none'}
        strokeWidth={3}
        height={height}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        onMouseDown={(e) => {
          setSelected();
          onClick(e);
        }}
      />
    );
  }, [colorSpring, height, isSelected, onClick, setSelected, width, xSpring, ySpring]);

  useEffect(() => {
    currXOrder.current = xOrder;
    currYOrder.current = yOrder;
  }, [xOrder, yOrder]);

  const formatter = useMemo(() => {
    return d3.format('.3s');
  }, []);

  return isHovered ? (
    <Tooltip withArrow arrowSize={6} withinPortal label={label === null ? 'null' : formatter(label)}>
      {rect}
    </Tooltip>
  ) : (
    rect
  );
}
