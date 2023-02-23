import * as React from 'react';
import { Anchor } from '@mantine/core';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';
import datavisynLogoBlack from '../../assets/datavisyn_black.svg';

export function DatavisynLogo({ color }: { color: 'white' | 'black' }) {
  return (
    <Anchor
      href="https://datavisyn.io/"
      rel="noreferrer"
      target="_blank"
      sx={{
        // Center the image
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img src={color === 'white' ? datavisynLogoWhite : datavisynLogoBlack} alt="logo" style={{ height: '24px' }} />
    </Anchor>
  );
}
