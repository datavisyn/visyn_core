import { Select } from '@mantine/core';
import * as React from 'react';
import { ECloudType } from './interfaces';

interface HexbinOptionSelectProps {
  callback: (c: ECloudType) => void;
  currentSelected: ECloudType;
}

export function RaincloudCloudSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { value: ECloudType.SPLIT_VIOLIN, label: ECloudType.SPLIT_VIOLIN },
    { value: ECloudType.HEATMAP, label: ECloudType.HEATMAP },
    { value: ECloudType.HISTOGRAM, label: ECloudType.HISTOGRAM },
  ];
  return <Select withinPortal label="Cloud options" onChange={(e) => callback(e as ECloudType)} data={options} value={currentSelected} />;
}
