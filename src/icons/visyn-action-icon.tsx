import React from 'react';

import { ActionIcon, ActionIconProps, PolymorphicComponentProps } from '@mantine/core';

import { resolveIconFactory } from './adapters/util';
import { AgnosticIconDefinition } from './types';

type VisynActionIconProps = PolymorphicComponentProps<'button', ActionIconProps> & {
  icon: AgnosticIconDefinition;
};

/**
 * A wrapper around Mantine's ActionIcon that automatically
 * passes the size prop to the child icon.
 */
export function VisynActionIcon({ size = 'md', variant = 'transparent', color = 'dark', icon, ...rest }: VisynActionIconProps) {
  return (
    <ActionIcon size={size} variant={variant} color={color} {...rest}>
      {resolveIconFactory(icon, size)}
    </ActionIcon>
  );
}
