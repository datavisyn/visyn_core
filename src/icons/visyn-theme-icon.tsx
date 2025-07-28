import React, { cloneElement, isValidElement } from 'react';

import { MantineSize, ThemeIcon, ThemeIconProps } from '@mantine/core';

type VisynThemeIconProps = ThemeIconProps & {
  children: React.ReactElement<{ size?: MantineSize | number }>;
};

/**
 * A wrapper around Mantine's ThemeIcon that automatically
 * passes the size prop to the child icon.
 */
export function VisynThemeIcon({ children, size = 'md', variant = 'transparent', color = 'dark', ...rest }: VisynThemeIconProps) {
  const iconWithSize = isValidElement(children) ? cloneElement(children, { size }) : children;

  return (
    <ThemeIcon size={size} variant={variant} color={color} {...rest}>
      {iconWithSize}
    </ThemeIcon>
  );
}
