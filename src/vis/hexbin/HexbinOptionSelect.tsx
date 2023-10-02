import { Select } from '@mantine/core';
import * as React from 'react';
import { i18n } from '../../i18n';
import { EHexbinOptions } from './interfaces';

interface HexbinOptionSelectProps {
  callback: (c: EHexbinOptions) => void;
  currentSelected: EHexbinOptions;
}

export function HexbinOptionSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { value: EHexbinOptions.COLOR, label: EHexbinOptions.COLOR },
    { value: EHexbinOptions.BINS, label: EHexbinOptions.BINS },
    { value: EHexbinOptions.PIE, label: EHexbinOptions.PIE },
  ];
  return (
    <Select withinPortal label={i18n.t('visyn:vis.hexbinOptions')} onChange={(e) => callback(e as EHexbinOptions)} data={options} value={currentSelected} />
  );
}
