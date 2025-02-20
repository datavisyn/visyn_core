import * as React from 'react';

import { Anchor } from '@mantine/core';

import datavisynLogoBlack from '../../assets/datavisyn_black.svg';
import datavisynLogoColor from '../../assets/datavisyn_color.svg';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';

export function DatavisynLogo({ color }: { color: 'white' | 'black' | 'color' }) {
  const source = color === 'white' ? datavisynLogoWhite : color === 'black' ? datavisynLogoBlack : datavisynLogoColor;
  return (
    <Anchor display="flex" href="https://datavisyn.io/" target="_blank">
      <img src={source} alt="logo" style={{ height: '24px' }} />
    </Anchor>
  );
}
