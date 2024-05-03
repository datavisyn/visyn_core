import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform } from '../interfaces';
import { rescaleX, rescaleY } from '../transform';

interface UseTransformScaleProps {
  domain: number[];
  range: number[];
  transform?: ZoomTransform;
  direction: 'x' | 'y';
}

export function useTransformScale({ domain, range, transform, direction }: UseTransformScaleProps) {
  return useMemo(() => {
    if (!domain || !range) {
      return null;
    }

    const scale = scaleLinear().domain(domain).range(range);

    if (transform) {
      return {
        base: scale,
        scaled: direction === 'x' ? rescaleX(transform, scale) : rescaleY(transform, scale),
      };
    }

    return {
      base: scale,
      scaled: scale,
    };

    // We dont want to compare with range/domain reference, only the primitive values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain?.[0], domain?.[1], range?.[0], range?.[1], transform, direction]);
}
