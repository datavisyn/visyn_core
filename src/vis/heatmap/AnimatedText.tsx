import * as React from 'react';
import { useMemo } from 'react';
import { useSpring, animated, easings } from 'react-spring';

export function AnimatedText({ x, y, children, order }: { x: number; y: number; children; order?: number }) {
  const spring = useSpring({ x, y, config: { duration: 2000, easing: easings.easeInOutSine }, delay: 2000 * order });

  const line = useMemo(() => {
    return (
      <animated.text {...spring} color="gray" fontSize={10}>
        {children}
      </animated.text>
    );
  }, [children, spring]);

  return line;
}
