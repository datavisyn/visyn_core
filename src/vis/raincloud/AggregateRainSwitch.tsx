import { Switch } from '@mantine/core';
import * as React from 'react';

interface AggregateRainSwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function AggregateRainSwitch({ callback, currentValue }: AggregateRainSwitchProps) {
  return <Switch mt="lg" checked={currentValue} onChange={(event) => callback(event.currentTarget.checked)} label="Aggregate rain" />;
}
