import { Tooltip } from '@mantine/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, easings, animated } from 'react-spring';
import { ERainType } from '../interfaces';

export function Circle({
  x,
  y,
  id,
  raincloudType,
  color,
  isStrip,
}: {
  x: number;
  y: number;
  id: string;
  raincloudType: ERainType;
  color: string;
  isStrip: boolean;
}) {
  const raincloudTypeRef = useRef<ERainType>(raincloudType);
  const [isHover, setIsHover] = useState(false);
  const [props] = useSpring(
    () => ({
      immediate: () => {
        return raincloudTypeRef.current === raincloudType;
      },
      to: { cx: x, cy: y, x: x - 4, y: y - 4, height: isStrip ? 50 : 8, width: isStrip ? 4 : 8, rx: isStrip ? 0 : 100 },
      config: {
        duration: 750,
        easing: easings.easeInOutSine,
      },
    }),
    [raincloudType, x, y, isStrip],
  );

  useEffect(() => {
    raincloudTypeRef.current = raincloudType;
  }, [raincloudType]);

  const gEle = useMemo(() => {
    return (
      <g onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
        {!isStrip ? <animated.circle key={id} r={4} {...props} fill={color} /> : null}
        {isStrip ? <animated.rect {...props} fill={color} /> : null}
      </g>
    );
  }, [color, id, isStrip, props]);

  return isHover ? (
    <Tooltip label={id} keepMounted={false}>
      {gEle}
    </Tooltip>
  ) : (
    gEle
  );
}
