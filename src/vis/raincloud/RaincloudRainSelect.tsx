import { Select } from '@mantine/core';
import * as React from 'react';
import { ERainType } from './interfaces';

interface HexbinOptionSelectProps {
  callback: (c: ERainType) => void;
  currentSelected: ERainType;
}

export function RaincloudRainSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { value: ERainType.DOTPLOT, label: ERainType.DOTPLOT },
    { value: ERainType.BEESWARM, label: ERainType.BEESWARM },
    { value: ERainType.WHEATPLOT, label: ERainType.WHEATPLOT },
    { value: ERainType.STRIPPLOT, label: ERainType.STRIPPLOT },
  ];
  return <Select label="Rain options" onChange={(e) => callback(e as ERainType)} data={options} value={currentSelected} />;
}
