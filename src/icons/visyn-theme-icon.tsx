import React from 'react';

import { PolymorphicComponentProps, ThemeIcon, ThemeIconProps } from '@mantine/core';

import { resolveIconFactory } from './adapters/util';
import { AgnosticIconDefinition } from './types';

type VisynThemeIconProps = PolymorphicComponentProps<'div', ThemeIconProps> & {
  icon: AgnosticIconDefinition;
};

/**
 * A wrapper around Mantine's ActionIcon that automatically
 * passes the size prop to the child icon.
 */
export function VisynThemeIcon({ size = 'md', variant = 'transparent', color = 'dark', icon, ...rest }: VisynThemeIconProps) {
  return (
    <ThemeIcon size={size} variant={variant} color={color} {...rest}>
      {resolveIconFactory(icon, size)}
    </ThemeIcon>
  );
}
