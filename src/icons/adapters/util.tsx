import * as React from 'react';

import { AgnosticIconDefinition, VisynMantineSize } from '../types';
import { isFontAwesomeIcon, isLucideIcon, isVisynIcon } from './typeguards';
import { VisynFontAwesomeIcon } from './visyn-font-awesome-icon';
import { VisynLucideIcon } from './visyn-lucide-icon';

export function resolveIconFactory(Icon: AgnosticIconDefinition, size: VisynMantineSize) {
  if (isFontAwesomeIcon(Icon)) {
    return <VisynFontAwesomeIcon icon={Icon} size={size} />;
  }
  if (isLucideIcon(Icon)) {
    return <VisynLucideIcon icon={Icon} size={size} />;
  }
  if (isVisynIcon(Icon)) {
    return <Icon size={size} />;
  }

  throw new Error('Unsupported icon type');
}
