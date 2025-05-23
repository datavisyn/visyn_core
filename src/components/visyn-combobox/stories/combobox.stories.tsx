import React from 'react';

import { faAppleWhole } from '@fortawesome/free-solid-svg-icons/faAppleWhole';
import { faFish } from '@fortawesome/free-solid-svg-icons/faFish';
import { faKiwiBird } from '@fortawesome/free-solid-svg-icons/faKiwiBird';
import { faShrimp } from '@fortawesome/free-solid-svg-icons/faShrimp';
import { faWorm } from '@fortawesome/free-solid-svg-icons/faWorm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, useCombobox } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { ComboboxParsedItemWithDescriptionGroup } from '../interfaces';
import { VisynOption } from '../visyn-option';
import { IVisynSelect, VisynSelect } from '../visyn-select';

interface Item {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

const groceriesWithIcon: Item[] = [
  {
    icon: <FontAwesomeIcon icon={faFish} />,
    value: 'fish',
    label: 'Fishasdf safa sfas asdfasfsadfasf asdfasdf asdf as fs ',
    description: 'Natural and omega3-rich asdf asfasf fsasdf sdf sdfa sf',
  },
  { icon: <FontAwesomeIcon icon={faKiwiBird} />, value: 'kiwi', label: 'Kiwi', description: 'Nutrient-packed green fruit' },
  { icon: <FontAwesomeIcon icon={faShrimp} />, value: 'shrimp', label: 'Shrimp', description: 'Crunchy and vitamin-rich sea food' },
  { icon: <FontAwesomeIcon icon={faWorm} />, value: 'worm', label: 'Worm', description: 'Indulgent and decadent treat' },
  { icon: <FontAwesomeIcon icon={faAppleWhole} />, value: 'apples', label: 'Apples', description: 'Crisp and refreshing fruit' },
];

const groceries: Item[] = groceriesWithIcon.map((item) => ({
  ...item,
  icon: null,
}));

const groceriesWithDisabled: Item[] = groceriesWithIcon.map((item) => ({
  ...item,
  disabled: item.value === 'fish',
}));

const groceriesWithGroups = [
  {
    group: 'Fruits',
    items: [
      { value: 'kiwi', label: 'Kiwi', description: 'Nutrient-packed green fruit' },
      { value: 'apples', label: 'Apples', description: 'Crisp and refreshing fruit' },
    ],
  },
  {
    group: 'Seafood',
    items: [
      {
        value: 'fish',
        label: 'Fishasdf safa sfas asdfasfsadfasf asdfasdf asdf as fs ',
        description: 'Natural and omega3-rich asdf asfasf fsasdf sdf sdfa sf',
      },
      { value: 'shrimp', label: 'Shrimp', description: 'Crunchy and vitamin-rich sea food' },
    ],
  },
  {
    group: 'Worms',
    items: [{ value: 'worm', label: 'Worm', description: 'Indulgent and decadent treat' }],
  },
];

const badgeLabel = (item: Item) => {
  if (item.value === 'fish') {
    return 'Fish';
  }
  if (item.value === 'kiwi') {
    return 'Long fruit label';
  }
  if (item.value === 'shrimp') {
    return 'Fish';
  }
  if (item.value === 'worm') {
    return 'Worm';
  }
  if (item.value === 'apples') {
    return 'Fruit';
  }
};

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
        size="xs"
        clearable
        onSearchChange={setSearch}
        searchValue={search}
        label="Snacks"
        renderOption={(evnt) => {
          return <VisynOption {...evnt.option} {...evnt} size="xs" search={search} />;
        }}
        comboboxSearchProps={{
          placeholder: 'Search for a snack...',
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

export const SelectOptionsWithIcon: Story = {
  args: {
    data: groceriesWithIcon,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
    searchable: false,
  },
};

export const SelectOptionsWithBadge: Story = {
  args: {
    data: groceries.map((item) => ({
      ...item,
      badgeLabel: badgeLabel(item),
    })),
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

export const SelectWithOptionsLimit: Story = {
  args: {
    data: groceries,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
    limit: 2,
  },
};

export const SelectWithCustomOption: Story = {
  args: {
    data: groceries,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
    renderOption: (evnt) => {
      return <div>{evnt.option.label}</div>;
    },
  },
};

export const SelectWithGroups: Story = {
  args: {
    // TODO: Moritz fix typings
    data: groceriesWithGroups as ComboboxParsedItemWithDescriptionGroup[],
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
  },
};

export const SelectWithDisabledOption: Story = {
  args: {
    data: groceriesWithDisabled,
    size: 'xs',
    clearable: true,
    placeholder: 'Pick a snack',
  },
};
