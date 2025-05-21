import * as React from 'react';
import { useState } from 'react';

import { Box, Combobox, Select, Text, useCombobox } from '@mantine/core';

import { VisynOptionsDropdown } from '../components/visyn-combobox';
import { VisynSelect } from '../components/visyn-combobox/visyn-select';
import { VisynSelectTarget } from '../components/visyn-combobox/visyn-select-target';

const groceries = ['🍎 Apples', '🍌 Bananas', '🥦 Broccoli', '🥕 Carrots', '🍫 Chocolate', '🍇 Grapes'];

export function Example() {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
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

  const data = [
    {
      group: 'Frontend',
      items: [
        { label: 'Test', value: 'test', extra: 1 },
        { label: 'Angular', value: 'angular', extra: 2 },
      ],
    },
    {
      group: 'Backend',
      items: [
        { label: 'Test', value: 'test2', extra: 3 },
        { label: 'Angular', value: 'angular2', extra: 4 },
      ],
    },
  ];

  const flat = [
    { label: 'Test', value: 'test2', extra: 3 },
    { label: 'Angular', value: 'angular2', extra: 4 },
  ];

  return (
    <>
      <VisynSelect
        data={flat}
        size="xs"
        clearable
        placeholder="Cool value"
        renderOption={(evnt) => {
          return <div>test</div>;
        }}
      />

      <Box mt="xs">
        <Text span size="sm" c="dimmed">
          Selected item:{' '}
        </Text>

        <Text span size="sm">
          {selectedItem || 'Nothing selected'}
        </Text>
      </Box>
    </>
  );
}
