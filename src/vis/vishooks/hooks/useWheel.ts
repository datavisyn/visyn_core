import { useRef, RefObject, useEffect } from 'react';
import { normalizeWheelEvent } from '../normalizeWheelEvent';
import { Extent, NormalizedWheelEvent } from '../interfaces';
import { outsideExtent, relativeMousePosition } from '../util';

export interface UseWheelProps {
  onWheel: (event: NormalizedWheelEvent) => void;

  /**
   * Extent to constrain the wheel event within the bounds of the extent.
   */
  extent?: Extent;
}

/**
 * Adds active wheel listener to element.
 */
export function useWheel(ref: RefObject<HTMLElement>, props: UseWheelProps) {
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return () => {};
    }

    const handler = (event: WheelEvent) => {
      const relativePosition = relativeMousePosition(element, {
        x: event.clientX,
        y: event.clientY,
      });

      const bounds = element.getBoundingClientRect();
      const extent = propsRef.current.extent || {
        x1: 0,
        x2: bounds.width,
        y1: 0,
        y2: bounds.height,
      };

      if (outsideExtent(relativePosition, extent)) {
        return;
      }

      event.preventDefault();

      propsRef.current.onWheel?.({
        ...normalizeWheelEvent(event),
        x: relativePosition.x,
        y: relativePosition.y,
      });
    };

    element.addEventListener('wheel', handler, { passive: false });

    return () => {
      element.removeEventListener('wheel', handler);
    };
  }, [ref]);
}
