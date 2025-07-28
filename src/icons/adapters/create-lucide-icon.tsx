import React from 'react';

import { type LucideIcon } from 'lucide-react';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export const createLucideIcon = (Icon: LucideIcon) => {
  function LucideWrapper({ size }: VisynIconProps) {
    return <Icon size={resolveIconSize(size)} />;
  }

  // Add unique tag for type guarding
  (LucideWrapper as typeof LucideWrapper & { isVisynIcon: true }).isVisynIcon = true;

  return LucideWrapper;
};
