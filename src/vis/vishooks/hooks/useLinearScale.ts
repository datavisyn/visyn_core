import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { rescaleX, rescaleY } from '../transform';

interface UseLinearScaleProps {
  domain: number[];
  range: number[];
}

export function useLinearScale({ domain, range }: UseLinearScaleProps) {
  return useMemo(() => {
    if (!domain || !range) {
      return null;
    }

    return scaleLinear().domain(domain).range(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain?.[0], domain?.[1], range?.[0], range?.[1]]);
}
