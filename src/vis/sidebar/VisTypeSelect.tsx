import { Select } from '@mantine/core';
import * as React from 'react';
import { useVisProvider } from '../Provider';
import { ESupportedPlotlyVis } from '../interfaces';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  const { visTypes } = useVisProvider();

  return (
    <Select
      withinPortal
      label="Visualization type"
      // components={{Option: optionLayout}}
      onChange={(e) => callback(e as ESupportedPlotlyVis)}
      name="visTypes"
      data={visTypes.map((t) => {
        return {
          value: t.type,
          label: t.type,
        };
      })}
      value={currentSelected}
    />
  );
}
