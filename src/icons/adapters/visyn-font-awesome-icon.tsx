import * as React from 'react';

import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export function VisynFontAwesomeIcon({ size, icon }: VisynIconProps & { icon: IconProp }) {
  const pixelSize = resolveIconSize(size);

  return <FontAwesomeIcon icon={icon} style={{ width: pixelSize, height: pixelSize }} />;
}
