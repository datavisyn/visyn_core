import * as React from 'react';
import { useMemo, useRef } from 'react';
import { useSpring, animated, easings } from 'react-spring';

export function AnimatedLine({ x1, x2, y1, y2, order = 1 }: { y2: number; y1: number; x2: number; x1: number; order?: number }) {
  const myOrder = useRef(order);

  const isImmediate = myOrder.current === order;
  const spring = useSpring({
    x1,
    y1,
    x2,
    y2,
    config: { duration: 2000, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : 2000 * order,
    immediate: isImmediate,
  });

  React.useEffect(() => {
    myOrder.current = order;
  }, [order]);

  const line = useMemo(() => {
    return <animated.line {...spring} stroke="white" strokeWidth={1} />;
  }, [spring]);

  return line;
}
