import { Tooltip } from '@mantine/core';
import { useSpring, animated, easings } from 'react-spring';

import * as React from 'react';

export function Circle({ x, y, label, opacity, color, r }: { x: number; y: number; label: string; opacity: number; color: string; r: number }) {
  const springs = useSpring({
    cx: x,
    cy: y,
    r,
    fill: color,
    config: { duration: 1000, easing: easings.easeInOutSine },
  });

  return (
    <Tooltip withinPortal label={label}>
      <animated.circle cx={x} cy={y} opacity={opacity} fill={color} {...springs} />
    </Tooltip>
  );
}
