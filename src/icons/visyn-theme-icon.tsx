import React from 'react';

import { PolymorphicComponentProps, ThemeIcon, ThemeIconProps } from '@mantine/core';

import { resolveIconFactory } from './adapters/util';
import { AgnosticIconDefinition } from './types';

export type VisynThemeIconProps = PolymorphicComponentProps<'div', ThemeIconProps> & {
  /** The icon to be displayed inside the VisynThemeIcon. */
  icon: AgnosticIconDefinition;
};

/**
 * A wrapper around Mantine's ThemeIcon that automatically
 * passes the size prop to the child icon.
 */
export function VisynThemeIcon({ size = 'md', variant = 'transparent', color = 'dark', icon, ...rest }: VisynThemeIconProps) {
  return (
    <ThemeIcon size={size} variant={variant} color={color} {...rest}>
      {resolveIconFactory(icon, size)}
    </ThemeIcon>
  );
}
