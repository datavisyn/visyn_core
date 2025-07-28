import * as React from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { LucideIcon } from 'lucide-react';

import { VisynIconProps, VisynMantineSize } from '../types';
import { isFontAwesomeIcon, isLucideIcon, isVisynIcon } from './typeguards';
import { VisynFontAwesomeIcon } from './visyn-font-awesome-icon';
import { VisynLucideIcon } from './visyn-lucide-icon';

export function resolveIconFactory(Icon: IconProp | LucideIcon | React.FunctionComponent<VisynIconProps>, size: VisynMantineSize) {
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
