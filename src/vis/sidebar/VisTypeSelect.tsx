import { Select, Text } from '@mantine/core';
import * as React from 'react';
import { HelpHoverCard } from '../../components/HelpHoverCard';
import { useVisProvider } from '../Provider';
import { ESupportedPlotlyVis } from '../interfaces';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

// eslint-disable-next-line react/display-name
const SelectItem = React.forwardRef<HTMLDivElement, ItemProps>(({ image, label, description, ...others }: ItemProps, ref) => (
  <div ref={ref} {...others}>
    <Text size="sm">{label}</Text>
    <Text size="xs" opacity={0.65} lineClamp={2}>
      {description}
    </Text>
  </div>
));

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  const { visTypes, getVisByType } = useVisProvider();

  const currentVis = getVisByType(currentSelected);

  // @TODO @MORITZ
  // itemComponent={SelectItem}
  return (
    <Select
      searchable
      label={
        <HelpHoverCard
          title={
            <Text size="sm" fw={500}>
              Visualization type
            </Text>
          }
          content={<Text size="sm">{currentVis?.description}</Text>}
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
