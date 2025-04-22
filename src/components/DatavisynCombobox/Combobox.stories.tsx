import React, { useState } from 'react';

import { Center, Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { DVSelectTarget } from './DVSelectTarget';
import { DatavisynOptionsDropdown } from './DatavisynOptionsDropdown';

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
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          w={200}
        >
          {value || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <DatavisynOptionsDropdown data={options}
      withSearch
      />
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
