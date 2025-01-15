import { ZoomTransform as D3ZoomTransform, scaleLinear } from 'd3v7';
import { ZoomTransform } from '../interfaces';
import { rescaleX, rescaleY } from '../transform';
import { sxi, txi, tyi } from '../math/matrix4x4';
import { useDeepMemo } from '../../../hooks/useDeepMemo';

interface UseTransformScaleProps {
  domain: number[];
  range: number[];
  transform?: ZoomTransform;
  direction: 'x' | 'y';
  transformTarget?: 'domain' | 'range';
}

export function useTransformScale({ domain, range, transform, direction, transformTarget }: UseTransformScaleProps) {
  return useDeepMemo(() => {
    // Invalid data case
    if (!domain || !range) {
      return null;
    }

    const scale = scaleLinear().domain(domain).range(range);

    // Untransformed case
    if (!transform) {
      return {
        base: scale,
        scaled: scale,
      };
    }

    switch (transformTarget ?? (domain.length === 2 ? 'domain' : 'range')) {
      case 'domain':
        return {
          base: scale,
          scaled: direction === 'x' ? rescaleX(transform, scale) : rescaleY(transform, scale),
        };
      case 'range': {
        const d3transform = new D3ZoomTransform(transform[sxi]!, transform[txi]!, transform[tyi]!);
        const transformedRange =
          direction === 'x' ? scale.range().map((value) => d3transform.applyX(value)) : scale.range().map((value) => d3transform.applyY(value));

        return {
          base: scale,
          scaled: scale.range(transformedRange),
        };
      }
      default:
        throw new Error('Invalid transform target');
    }

    // We dont want to compare with range/domain reference, only the primitive values
  }, [domain, range, transform, direction, transformTarget]);
}
