import React, { useState } from 'react';

import { Center, Combobox, Input, useCombobox } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { DatavisynOptionsDropdown } from './DatavisynOptionsDropdown';
import { DatavisynComboboxTarget } from './SelectTarget';

const meta: Meta<typeof Combobox> = {
  component: Combobox,
};

export default meta;
type Story = StoryObj<typeof Combobox>;

/*
 * Example Button story with React Hooks.
 * See note below related to this example.
 */
function Select() {
  const groceries = ['🍎 Apples', '🍌 Bananas', '🥦 Broccoli', '🥕 Carrots', '🍫 Chocolate', '🍇 Grapes'];

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);

  const options = groceries.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
    >
      <DatavisynComboboxTarget clearable value={value} setValue={setValue} combobox={combobox}>
        {value || <Input.Placeholder>Placeholder</Input.Placeholder>}
      </DatavisynComboboxTarget>

      <DatavisynOptionsDropdown data={options} />
    </Combobox>
  );
}

export const BasicSelect: Story = {
  render: () => (
    <Center h={400}>
      <Select />
    </Center>
  ),
};

export const BasicMultiselect: Story = {
  render: () => (
    <Center h={400}>
      <Select />
    </Center>
  ),
};
