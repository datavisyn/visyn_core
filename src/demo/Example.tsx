import * as React from 'react';
import { useState } from 'react';

import { Box, Combobox, Highlight, Text, useCombobox } from '@mantine/core';

import { VisynOptionsDropdown } from '../components/visyn-combobox';
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

  const data = groceries.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <>
      <Combobox
        store={combobox}
        position="bottom-start"
        withArrow
        withinPortal={false}
        onOptionSubmit={(val) => {
          setSelectedItem(val);
          combobox.closeDropdown();
        }}
      >
        <VisynSelectTarget selectFirstOptionOnChange size="xs" combobox={combobox} data={data} value={selectedItem} onChange={setSelectedItem} clearable />

        <VisynOptionsDropdown
          data={data}
          search={search}
          onSearchChange={setSearch}
          limit={10}
          maxDropdownHeight={200}
          renderOption={(input) => {
            return (
              <div>
                <Highlight inherit highlight={search}>
                  {input.option.label}
                </Highlight>
                <Text inherit c="dimmed">
                  description
                </Text>
              </div>
            );
          }}
        />
      </Combobox>

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
