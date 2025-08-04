import * as React from 'react';

import { type LucideIcon } from 'lucide-react';

import { resolveIconSize } from '../size-map';
import { VisynIconProps } from '../types';

export function VisynLucideIcon({ size, icon: Icon }: VisynIconProps & { icon: LucideIcon }) {
  const resolvedSize = resolveIconSize(size);

  return <Icon size={resolvedSize} />;
}
