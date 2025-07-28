import React from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export const createFontAwesomeIcon = (icon: IconProp) => {
  // eslint-disable-next-line func-names, react/display-name
  return function ({ size = 'md', ...props }: VisynIconProps) {
    const pixelSize = resolveIconSize(size);

    return <FontAwesomeIcon icon={icon} style={{ width: pixelSize, height: pixelSize }} {...props} />;
  };
};
