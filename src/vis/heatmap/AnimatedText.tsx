import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useSpring, animated, easings } from 'react-spring';

export function AnimatedText({
  x,
  y,
  children,
  order,
  width,
  height,
  bold = false,
  setImmediate = true,
}: {
  x: number;
  y: number;
  children;
  order?: number;
  bold?: boolean;
  width: number;
  height: number;
  setImmediate?: boolean;
}) {
  const myOrder = useRef(order);

  const isImmediate = setImmediate || myOrder.current === order;
  const spring = useSpring({
    x,
    y,
    width,
    height,
    config: { duration: 2000, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : 2000 * order,
    immediate: isImmediate,
  });

  const line = useMemo(() => {
    return <animated.foreignObject {...spring}>{children}</animated.foreignObject>;
  }, [children, spring]);

  useEffect(() => {
    myOrder.current = order;
  }, [order]);

  return line;
}
