import { MantineSize } from '@mantine/core';

import { VisynMantineSize } from './types';

export const mantineSizeToPx: Record<MantineSize | `input-${MantineSize}`, number> = {
  xs: 11,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 29,
  'input-xs': 11,
  'input-sm': 14,
  'input-md': 18,
  'input-lg': 22,
  'input-xl': 29,
};

const sizeSet = new Set(Object.keys(mantineSizeToPx));

export function resolveIconSize(size?: VisynMantineSize): number | string {
  // For known mantine sizes, return the corresponding pixel value
  if (size && typeof size === 'string' && sizeSet.has(size)) {
    return mantineSizeToPx[size as MantineSize | `input-${MantineSize}`];
  }

  return '70%';
}
