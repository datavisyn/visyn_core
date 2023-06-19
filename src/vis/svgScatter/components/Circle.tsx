import { Tooltip } from '@mantine/core';
import { useSpring, easings, animated } from 'react-spring';
import * as d3 from 'd3v7';
import * as React from 'react';

export function Circle({ x, y, label, opacity, color, radius }: { x: number; y: number; label: string; opacity: number; color: string; radius: number }) {
  const spring = useSpring({ cx: x, cy: y, config: { duration: 1000, easing: easings.easeInOutSine } });

  return (
    <Tooltip withinPortal label={label}>
      <animated.circle fill={color} r={radius} opacity={opacity} {...spring} />
    </Tooltip>
  );
}
