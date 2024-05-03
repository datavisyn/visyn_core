import { useMemo } from 'react';
import { scaleBand } from 'd3-scale';
import { ZoomTransform } from '../interfaces';
import { m4, v3 } from '../math';

type UseBandScaleProps = {
  direction: 'x' | 'y';
  domain: string[];
  range: [number, number];
  transform: ZoomTransform;
};

export function useBandScale({ direction, domain, range, transform }: UseBandScaleProps) {
  return useMemo(() => {
    const s = m4.getScaling(v3.I(), transform);
    const t = m4.getTranslation(v3.I(), transform);
    const scaledRange = direction === 'x' ? range.map((r) => r * s[0] + t[0]) : range.map((r) => r * s[1] + t[1]);
    return scaleBand().domain(domain).range(scaledRange);
  }, [domain, range, direction, transform]);
}

export default useBandScale;
