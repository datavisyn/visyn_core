import * as React from 'react';
import { normalizeWheelEvent } from '../normalizeWheelEvent';
import { Extent, NormalizedWheelEvent } from '../interfaces';
import { outsideExtent, relativeMousePosition } from '../util';
import { useSetRef } from '../../../hooks';

export interface UseWheelProps {
  onWheel: (event: NormalizedWheelEvent) => void;

  /**
   * Extent to constrain the wheel event within the bounds of the extent.
   */
  extent?: Extent;

  preventDefault?: (event: NormalizedWheelEvent) => boolean;
}

/**
 * Adds active wheel listener to element.
 */
export function useWheel(props: UseWheelProps) {
  const propsRef = React.useRef(props);
  propsRef.current = props;

  const handlerRef = React.useRef<(event: WheelEvent) => void>();

  const { ref, setRef } = useSetRef({
    register: (element) => {
      handlerRef.current = (event) => {
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

        const normalizedEvent = normalizeWheelEvent(event);

        if (propsRef.current.preventDefault?.(normalizedEvent) ?? true) {
          event.preventDefault();
        }

        propsRef.current.onWheel?.({
          ...normalizedEvent,
          x: relativePosition.x,
          y: relativePosition.y,
        });
      };

      element.addEventListener('wheel', handlerRef.current, { passive: false });
    },
    cleanup: (element) => {
      element.removeEventListener('wheel', handlerRef.current);
    },
  });

  return { ref, setRef };
}
