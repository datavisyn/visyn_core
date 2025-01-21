import * as React from 'react';

import { Switch } from '@mantine/core';

interface HexOpacitySwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexOpacitySwitch({ callback, currentValue }: HexOpacitySwitchProps) {
  return <Switch checked={currentValue} onChange={(event) => callback(event.currentTarget.checked)} label="Opacity scale" />;
}
