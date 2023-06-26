import { Tooltip } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, easings, animated } from 'react-spring';
import { ERainType } from '../../interfaces';

export function Circle({ x, y, id, raincloudType, color }: { x: number; y: number; id: string; raincloudType: ERainType; color: string }) {
  const raincloudTypeRef = useRef<ERainType>(raincloudType);
  const [props] = useSpring(
    () => ({
      immediate: () => {
        return raincloudTypeRef.current === raincloudType;
      },
      to: { cx: x, cy: y },
      config: {
        duration: 750,
        easing: easings.easeInOutSine,
      },
    }),
    [raincloudType, x, y],
  );

  useEffect(() => {
    raincloudTypeRef.current = raincloudType;
  }, [raincloudType]);

  return (
    <g>
      <animated.circle key={id} r={4} {...props} fill={color} />
    </g>
  );
}
