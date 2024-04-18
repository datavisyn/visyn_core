import { Select, Text } from '@mantine/core';
import * as React from 'react';
import { useVisProvider } from '../Provider';
import { ESupportedPlotlyVis } from '../interfaces';
import { HelpHoverCard } from '../../components/HelpHoverCard';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  const { visTypes, getVisByType } = useVisProvider();

  const currentVis = getVisByType(currentSelected);

  return (
    <Select
      searchable
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
      onChange={(e) => callback(e as ESupportedPlotlyVis)}
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
