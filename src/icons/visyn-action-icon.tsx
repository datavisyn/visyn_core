import React from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ActionIcon, ActionIconProps, PolymorphicComponentProps } from '@mantine/core';
import { LucideIcon } from 'lucide-react';

import { resolveIconFactory } from './adapters/util';
import { VisynIconProps } from './types';

type VisynActionIconProps = PolymorphicComponentProps<'button', ActionIconProps> & {
  icon: IconProp | LucideIcon | React.FunctionComponent<VisynIconProps>;
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
