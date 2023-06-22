import { Tooltip } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, easings, animated } from 'react-spring';
import { ERainType } from '../../interfaces';

export function Circle({ x, y, id, raincloudType }: { x: number; y: number; id: string; raincloudType: ERainType }) {
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
      <Tooltip withinPortal label={id}>
        <animated.circle key={id} r={4} {...props} fill="cornflowerblue" />
      </Tooltip>
    </g>
  );
}
