import { Select } from '@mantine/core';
import * as React from 'react';
import { i18n } from '../../i18n';
import { ELightningType } from '../interfaces';

interface HexbinOptionSelectProps {
  callback: (c: ELightningType) => void;
  currentSelected: ELightningType;
}

export function RaincloudLightningSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { value: ELightningType.MEAN_AND_DEV, label: ELightningType.MEAN_AND_DEV },
    { value: ELightningType.MEAN, label: ELightningType.MEAN },
    { value: ELightningType.MEDIAN_AND_DEV, label: ELightningType.MEDIAN_AND_DEV },
    { value: ELightningType.BOXPLOT, label: ELightningType.BOXPLOT },
  ];
  return <Select withinPortal label="Lightning options" onChange={(e) => callback(e as ELightningType)} data={options} value={currentSelected} />;
}
