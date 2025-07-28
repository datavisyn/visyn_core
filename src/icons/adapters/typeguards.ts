import React from 'react';

import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { type LucideIcon } from 'lucide-react';

import { VisynIconProps } from '../types';

export function isFontAwesomeIcon(icon: any): icon is IconProp {
  return icon && typeof icon === 'object' && 'icon' in icon;
}

export function isLucideIcon(icon: any): icon is LucideIcon {
  return icon && typeof icon === 'object' && 'render' in icon;
}

export function isVisynIcon(icon: any): icon is React.FunctionComponent<VisynIconProps> {
  return icon && typeof icon === 'function' && (icon as { isVisynIcon: true }).isVisynIcon === true;
}
