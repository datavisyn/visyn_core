import { Anchor } from '@mantine/core';
import * as React from 'react';
import datavisynLogoBlack from '../../assets/datavisyn_black.svg';
import datavisynLogoColor from '../../assets/datavisyn_color.svg';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';

export function DatavisynLogo({ color }: { color: 'white' | 'black' | 'color' }) {
  const source = color === 'white' ? datavisynLogoWhite : color === 'black' ? datavisynLogoBlack : datavisynLogoColor;
  return (
    <Anchor href="https://datavisyn.io/" rel="noreferrer" target="_blank" display="inline-block" h={24}>
      <img src={source} alt="logo" style={{ height: '24px' }} />
    </Anchor>
  );
}
