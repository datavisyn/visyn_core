import * as React from 'react';

import { Switch } from '@mantine/core';

interface HexSizeSwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexSizeSwitch({ callback, currentValue }: HexSizeSwitchProps) {
  return <Switch checked={currentValue} onChange={(event) => callback(event.currentTarget.checked)} label="Size scale" />;
}
