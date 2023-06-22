import { Tooltip } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useSpring, easings, animated } from 'react-spring';
import { ERainType } from '..';

export function Circle({ x, y, id, raincloudType }: { x: number; y: number; id: string; raincloudType: ERainType }) {
  const [currentRaincloudType, setRaincloudType] = useState<ERainType>(raincloudType);
  const spring = useSpring({
    immediate: currentRaincloudType === raincloudType,
    cx: x,
    cy: y,
    config: {
      duration: 750,
      easing: easings.easeInOutSine,
    },
  });

  useEffect(() => {
    setRaincloudType(raincloudType);
  }, [raincloudType]);

  return (
    <g>
      <Tooltip withinPortal label={id}>
        <animated.circle key={id} r={4} {...spring} fill="cornflowerblue" />
      </Tooltip>
    </g>
  );
}
