import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useSpring, animated, easings } from 'react-spring';

export function AnimatedText({ x, y, children, order, bold = false }: { x: number; y: number; children; order?: number; bold?: boolean }) {
  const myOrder = useRef(order);

  const isImmediate = myOrder.current === order;
  const spring = useSpring({ x, y, config: { duration: 2000, easing: easings.easeInOutSine }, delay: isImmediate ? 0 : 2000 * order, immediate: isImmediate });

  const line = useMemo(() => {
    return (
      <animated.text {...spring} color="gray" fontSize={10} fontWeight={bold ? 900 : 500}>
        {children}
      </animated.text>
    );
  }, [bold, children, spring]);

  useEffect(() => {
    myOrder.current = order;
  }, [order]);

  return line;
}
