import React from 'react';

import { faAppleWhole } from '@fortawesome/free-solid-svg-icons/faAppleWhole';
import { faFish } from '@fortawesome/free-solid-svg-icons/faFish';
import { faKiwiBird } from '@fortawesome/free-solid-svg-icons/faKiwiBird';
import { faShrimp } from '@fortawesome/free-solid-svg-icons/faShrimp';
import { faWorm } from '@fortawesome/free-solid-svg-icons/faWorm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, useCombobox } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { VisynOption } from '../visyn-option';
import { IVisynSelect, VisynSelect } from '../visyn-select';

interface Item {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

const groceries: Item[] = [
  { icon: <FontAwesomeIcon icon={faFish} />, value: 'fish', label: 'Fish', description: 'Natural and omega3-rich' },
  { icon: <FontAwesomeIcon icon={faKiwiBird} />, value: 'kiwi', label: 'Kiwi', description: 'Nutrient-packed green fruit' },
  { icon: <FontAwesomeIcon icon={faShrimp} />, value: 'shrimp', label: 'Shrimp', description: 'Crunchy and vitamin-rich sea food' },
  { icon: <FontAwesomeIcon icon={faWorm} />, value: 'worm', label: 'Worm', description: 'Indulgent and decadent treat' },
  { icon: <FontAwesomeIcon icon={faAppleWhole} />, value: 'apples', label: 'Apples', description: 'Crisp and refreshing fruit' },
];

function VisynSelectWrapper(args: IVisynSelect<Item>) {
  const [search, setSearch] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch('');
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });
  return (
    <Box w="300" m="xs">
      <VisynSelect
        data={groceries}
        size="xs"
        clearable
        onSearchChange={setSearch}
        searchValue={search}
        placeholder="Cool value"
        label="Snacks"
        renderOption={(evnt) => {
          return <VisynOption {...evnt.option} {...evnt} size="xs" search={search} />;
        }}
        {...args}
      />
    </Box>
  );
}

const meta: Meta<typeof VisynSelectWrapper> = {
  component: VisynSelectWrapper,
  title: 'Components/VisynSelect',
};

export default meta;
type Story = StoryObj<typeof VisynSelectWrapper>;

export const BasicSelect: Story = {
  args: {
    data: groceries,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
    searchable: false,
  },
};

export const SelectWithSearch: Story = {
  args: {
    data: groceries,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
  },
};
