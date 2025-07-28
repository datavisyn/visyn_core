import * as React from 'react';

import { LucideIcon } from 'lucide-react';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export function VisynLucideIcon({ size = 'md', icon: Icon }: VisynIconProps & { icon: LucideIcon }) {
  const resolvedSize = resolveIconSize(size);

  return <Icon size={resolvedSize} />;
}
