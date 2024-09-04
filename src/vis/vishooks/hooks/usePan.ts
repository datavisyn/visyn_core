import { Dispatch } from 'react';
import { Direction, ZoomTransform } from '../interfaces';
import { useInteractions } from './useInteractions';
import { useControlledUncontrolled } from './useControlledUncontrolled';
import { defaultConstraint } from '../transform';
import { m4 } from '../math';

interface UsePanProps {
  value?: ZoomTransform;
  onChange?: (value: ZoomTransform) => void;
  defaultValue?: ZoomTransform;

  /**
   * Constrain the zoom transform.
   */
  constraint?: (transform: ZoomTransform) => ZoomTransform;

  /**
   * Direction to pan. 'x' pans horizontally, 'y' pans vertically, 'xy' pans both.
   */
  direction?: Direction;

  skip?: boolean;
}

export function usePan(options: UsePanProps = {}) {
  const [zoom, setZoom] = useControlledUncontrolled({
    value: options.value,
    defaultValue: options.defaultValue || m4.identityMatrix4x4(),
    onChange: options.onChange,
  });

  const { ref, setRef } = useInteractions({
    skip: options.skip,
    onDrag: (event) => {
      setZoom((oldMatrix) => {
        let newMatrix = m4.clone(oldMatrix);

        if (options.direction !== 'y') {
          newMatrix[12] += event.movementX;
        }

        if (options.direction !== 'x') {
          newMatrix[13] += event.movementY;
        }

        if (options.constraint) {
          newMatrix = options.constraint(newMatrix);
        } else {
          const bounds = event.parent.getBoundingClientRect();

          newMatrix = defaultConstraint(newMatrix, bounds.width, bounds.height);
        }

        return newMatrix;
      });
    },
  });

  return { ref, setRef, value: zoom, setValue: setZoom };
}
