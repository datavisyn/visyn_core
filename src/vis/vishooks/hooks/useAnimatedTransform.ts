/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';
import { ZoomTransform } from '../interfaces';
import { useSyncedRef } from '../../../hooks';

function linearInterpolate(startMatrix: ZoomTransform, endMatrix: ZoomTransform, t: number) {
  return startMatrix.map((startValue, index) => {
    const endValue = endMatrix[index];

    if (endValue === undefined) {
      throw new Error('Supplied matrices are not of the same length');
    }

    const cosT = (1 - Math.cos(t * Math.PI)) / 2;
    return startValue * (1 - cosT) + endValue * cosT;
  });
}

export function useAnimatedTransform({ onIntermediate }: { onIntermediate: (intermediateTransform: ZoomTransform) => void }) {
  const stateRef = React.useRef({
    start: undefined as ZoomTransform | undefined,
    end: undefined as ZoomTransform | undefined,
    t0: performance.now(),
  });

  const animationFrameRef = React.useRef<number | undefined>(undefined);
  const onIntermediateRef = useSyncedRef(onIntermediate);

  const requestFrame = () => {
    animationFrameRef.current = requestAnimationFrame((t1) => {
      if (stateRef.current.start && stateRef.current.end) {
        const t = (t1 - stateRef.current.t0) / 1000;
        // End of animation
        if (t >= 1) {
          animationFrameRef.current = undefined;
          onIntermediateRef.current(stateRef.current.end);
          return;
        }

        const newMatrix = linearInterpolate(stateRef.current.start, stateRef.current.end, t);
        onIntermediateRef.current(newMatrix);

        requestFrame();
      }
    });
  };

  const requestFrameRef = useSyncedRef(requestFrame);

  const animate = React.useCallback(
    (start: ZoomTransform, end: ZoomTransform) => {
      stateRef.current = {
        start,
        end,
        t0: performance.now(),
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      requestFrameRef.current();
    },
    [requestFrameRef],
  );

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    animate,
  };
}
