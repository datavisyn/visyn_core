import React from 'react';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export const createLucideIcon = (LucideIcon: React.FC<any>) => {
  // eslint-disable-next-line func-names, react/display-name
  return function ({ size = 'md', ...props }: VisynIconProps) {
    const pixelSize = resolveIconSize(size);

    return <LucideIcon size={pixelSize} {...props} />;
  };
};
