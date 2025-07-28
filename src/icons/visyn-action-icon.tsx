import React, { cloneElement, isValidElement } from 'react';

import { ActionIcon, ActionIconProps, MantineSize } from '@mantine/core';

type VisynActionIconProps = ActionIconProps & {
  children: React.ReactElement<{ size?: MantineSize | number }>;
};

/**
 * A wrapper around Mantine's ActionIcon that automatically
 * passes the size prop to the child icon.
 */
export function VisynActionIcon({ children, size = 'md', variant = 'transparent', color = 'dark', ...rest }: VisynActionIconProps) {
  const iconWithSize = isValidElement(children) ? cloneElement(children, { size }) : children;

  return (
    <ActionIcon size={size} variant={variant} color={color} {...rest}>
      {iconWithSize}
    </ActionIcon>
  );
}
