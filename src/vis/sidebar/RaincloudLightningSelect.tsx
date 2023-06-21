import { Select } from '@mantine/core';
import * as React from 'react';
import { i18n } from '../../i18n';
import { ELightningType } from '../interfaces';

interface HexbinOptionSelectProps {
  callback: (c: ELightningType) => void;
  currentSelected: ELightningType;
}

export function RaincloudLightningSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [{ value: ELightningType.MEAN_AND_DEV, label: ELightningType.MEAN_AND_DEV }];
  return (
    <Select withinPortal label={i18n.t('visyn:vis.hexbinOptions')} onChange={(e) => callback(e as ELightningType)} data={options} value={currentSelected} />
  );
}
