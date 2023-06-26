import { Select } from '@mantine/core';
import * as React from 'react';
import { ESupportedPlotlyVis } from '../interfaces';
import { getAllVisTypes } from '../provider/Provider';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  return (
    <Select
      withinPortal
      label="Visualization type"
      // components={{Option: optionLayout}}
      onChange={(e) => callback(e as ESupportedPlotlyVis)}
      name="visTypes"
      data={getAllVisTypes().map((t) => {
        return {
          value: t,
          label: t,
        };
      })}
      value={currentSelected}
    />
  );
}
