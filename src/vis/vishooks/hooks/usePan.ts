/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { Direction, ZoomTransform } from '../interfaces';
import { useControlledUncontrolled } from './useControlledUncontrolled';
import { UseInteractionsProps, useInteractions } from './useInteractions';
import { m4 } from '../math';
import { defaultConstraint } from '../transform';

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

  onClick?: NonNullable<UseInteractionsProps['onClick']>;

  skip?: boolean;
}

export function usePan(options: UsePanProps = {}) {
  const [zoom, setZoom] = useControlledUncontrolled({
    value: options.value,
    defaultValue: options.defaultValue || m4.identityMatrix4x4(),
    onChange: options.onChange,
  });

  // Sync the zoom ref with the current zoom value as useInteractions relys on the current zoom value but zoom value is not updated until the next render, i.e. causes lagging in dragging
  const zoomRef = React.useRef<UsePanProps['value']>(zoom);
  zoomRef.current = zoom;

  const { ref, setRef, state } = useInteractions({
    skip: options.skip,
    onClick: options.onClick,
    onDrag: (event) => {
      let newMatrix = m4.clone(zoomRef.current);

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
      zoomRef.current = newMatrix;
      setZoom(newMatrix);
    },
  });

  return { ref, setRef, value: zoom, setValue: setZoom, state };
}
