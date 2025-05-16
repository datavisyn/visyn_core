import * as React from 'react';

import { Select, Text } from '@mantine/core';

import { HelpHoverCard } from '../../components/HelpHoverCard';
import { useVisProvider } from '../Provider';
import { ESupportedPlotlyVis } from '../interfaces';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
  disabled?: boolean;
}

export function VisTypeSelect({ callback, currentSelected, disabled = false }: VisTypeSelectProps) {
  const { visTypes, getVisByType } = useVisProvider();

  const currentVis = getVisByType(currentSelected);

  return (
    <Select
      data-testid="SelectVisualizationType"
      searchable
      disabled={disabled}
      label={
        <HelpHoverCard
          title={
            <Text size="sm" fw="bold">
              Visualization type
            </Text>
          }
          content={currentVis?.description}
        />
      }
      styles={{
        label: {
          width: '100%',
        },
      }}
      // components={{Option: optionLayout}}
      onChange={(e: ESupportedPlotlyVis | null) => e && callback(e)}
      name="visTypes"
      // TODO: @MORITZ
      // itemComponent={SelectItem}
      maxDropdownHeight={380}
      data={visTypes.map((t) => {
        return {
          value: t.type,
          label: t.type,
          description: t.description,
        };
      })}
      value={currentSelected}
    />
  );
}
