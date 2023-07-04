import * as React from 'react';
import { useMemo } from 'react';
import { useSpring, animated, easings } from 'react-spring';

export function AnimatedLine({ x1, x2, y1, y2, order = 1 }: { y2: number; y1: number; x2: number; x1: number; order?: number }) {
  const spring = useSpring({ x1, y1, x2, y2, config: { duration: 2000, easing: easings.easeInOutSine }, delay: 2000 * order });

  const line = useMemo(() => {
    return <animated.line {...spring} stroke="white" strokeWidth={1} />;
  }, [spring]);

  return line;
}
