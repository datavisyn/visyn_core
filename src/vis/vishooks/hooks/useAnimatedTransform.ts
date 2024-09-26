import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomTransform } from '../interfaces';

const linearInterpolate = (startMatrix, endMatrix, t) => {
  return startMatrix.map((startValue, index) => {
    const endValue = endMatrix[index];
    const cosT = (1 - Math.cos(t * Math.PI)) / 2;
    return startValue * (1 - cosT) + endValue * cosT;
  });
};

export function useAnimatedTransform(initialTransform: ZoomTransform) {
  const [transform, setTransform] = useState(initialTransform);
  const animationFrameRef = useRef(null);
  const previousTransformRef = useRef(initialTransform);

  const setAnimatedTransform = useCallback((targetTransform, duration = 0) => {
    if (duration === 0) {
      setTransform(targetTransform);
      return;
    }
    const startTime = performance.now();

    const step = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      if (progress > 0) {
        const newMatrix = linearInterpolate(previousTransformRef.current, targetTransform, progress);
        setTransform(newMatrix);
      }
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    previousTransformRef.current = transform;
  }, [transform]);

  return { transform, setTransform: setAnimatedTransform, previousTransformRef };
}
