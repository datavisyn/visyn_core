import { RefObject } from 'react';
import { useWheel } from './useWheel';
import { calculateTransform, defaultConstraint } from '../transform';
import { useControlledUncontrolled } from './useControlledUncontrolled';
import { Direction, Extent, ZoomExtent, ZoomTransform } from '../interfaces';
import { m4 } from '../math';

interface UseZoomProps {
  value?: ZoomTransform;
  onChange?: (value: ZoomTransform) => void;
  defaultValue?: ZoomTransform;

  /**
   * Constrain the zoom transform.
   */
  constraint?: (transform: ZoomTransform) => ZoomTransform;

  /**
   * Direction to zoom. 'x' zooms horizontally, 'y' zooms vertically, 'xy' zooms both.
   */
  direction?: Direction;

  /**
   * Extent to constrain the zoom transform within the bounds of the extent.
   */
  extent?: Extent;

  /**
   * Zoom extent to constrain the zoom transform within the bounds of the extent.
   */
  zoomExtent?: ZoomExtent;

  /**
   * The transform origin.
   */
  transformOrigin?: [number, number];
}

/**
 * useZoom manages zoom state and provides a way to control zoom state.
 * It can be used controlled or uncontrolled.
 * In controlled mode you can provide a value and an onChange handler.
 * In uncontrolled mode you can provide a defaultValue and the hook
 * will return the current value and a setter.
 */
export function useZoom(ref: RefObject<HTMLElement>, options: UseZoomProps = {}) {
  const [internalValue, setInternalValue] = useControlledUncontrolled({
    value: options.value,
    defaultValue: options.defaultValue || m4.I(),
    onChange: options.onChange,
  });

  useWheel(ref, {
    extent: options.extent,
    onWheel: (event) => {
      let newZoom = calculateTransform(
        internalValue,
        event.x - (options.transformOrigin ? options.transformOrigin[0] : 0),
        event.y - (options.transformOrigin ? options.transformOrigin[1] : 0),
        -event.spinY,
        options.direction,
        options.zoomExtent,
      );

      if (options.constraint) {
        newZoom = options.constraint(newZoom);
      } else {
        const bounds = ref.current.getBoundingClientRect();

        newZoom = defaultConstraint(newZoom, bounds.width, bounds.height);
      }

      setInternalValue(newZoom);
    },
  });

  return { transform: internalValue, setTransform: setInternalValue };
}
