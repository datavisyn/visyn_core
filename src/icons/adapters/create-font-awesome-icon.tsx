import React from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export const createFontAwesomeIcon = (icon: IconProp) => {
  function FontAwesomeWrapper({ size }: VisynIconProps) {
    const pixelSize = resolveIconSize(size);

    return <FontAwesomeIcon icon={icon} style={{ width: pixelSize, height: pixelSize }} />;
  }

  // Add unique tag for type guarding
  (FontAwesomeWrapper as typeof FontAwesomeWrapper & { isVisynIcon: true }).isVisynIcon = true;

  return FontAwesomeWrapper;
};
