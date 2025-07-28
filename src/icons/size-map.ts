import { MantineSize } from '@mantine/core';

export const mantineSizeToPx: Record<MantineSize, number> = {
  xs: 11,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 29,
};

export function resolveIconSize(size: MantineSize | number): number {
  return typeof size === 'string' ? mantineSizeToPx[size] : size;
}
