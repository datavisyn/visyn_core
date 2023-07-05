import { Tooltip } from '@mantine/core';
import * as React from 'react';
import { useMemo, useState } from 'react';
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
  label: string;
  setSelected?: () => void;
  xOrder?: number;
  yOrder?: number;
  isSelected?: boolean;
  onClick?: (e: any) => void;
}) {
  const [isHovered, setIsHovered] = useState<boolean>();

  const xSpring = useSpring({ fill: color, x, config: { duration: DELAY, easing: easings.easeInOutSine }, delay: DELAY * xOrder });
  const ySpring = useSpring({ y, config: { duration: DELAY, easing: easings.easeInOutSine }, delay: DELAY * yOrder });

  const rect = useMemo(() => {
    return (
      <animated.rect
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
  }, [height, isSelected, onClick, setSelected, width, xSpring, ySpring]);

  return isHovered ? (
    <Tooltip withArrow arrowSize={6} withinPortal label={label}>
      {rect}
    </Tooltip>
  ) : (
    rect
  );
}
