import * as React from 'react';

import { faAppleWhole } from '@fortawesome/free-solid-svg-icons/faAppleWhole';
import { faFish } from '@fortawesome/free-solid-svg-icons/faFish';
import { faKiwiBird } from '@fortawesome/free-solid-svg-icons/faKiwiBird';
import { faShrimp } from '@fortawesome/free-solid-svg-icons/faShrimp';
import { faWorm } from '@fortawesome/free-solid-svg-icons/faWorm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Combobox, OptionsData, Stack, Text, useCombobox } from '@mantine/core';

import { VisynOption } from '../visyn-option';
import { VisynOptionsDropdown } from '../visyn-options-dropdown';
import { VisynSelectTarget } from '../visyn-select-target';

interface Item {
  emoji: React.ReactNode;
  value: string;
  description: string;
}

const groceries: Item[] = [
  { emoji: <FontAwesomeIcon icon={faAppleWhole} />, value: 'Apples', description: 'Crisp and refreshing fruit' },
  { emoji: <FontAwesomeIcon icon={faFish} />, value: 'Fish', description: 'Naturally sweet and potassium-rich fruit' },
  { emoji: <FontAwesomeIcon icon={faKiwiBird} />, value: 'Kiwi', description: 'Nutrient-packed green vegetable' },
  { emoji: <FontAwesomeIcon icon={faShrimp} />, value: 'Shrimp', description: 'Crunchy and vitamin-rich root vegetable' },
  { emoji: <FontAwesomeIcon icon={faWorm} />, value: 'Worm', description: 'Indulgent and decadent treat' },
];

export function SingleSelect() {
  const [search, setSearch] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const data = groceries.map((item) => ({
    label: item.value,
    ...item,
  }));
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
    <Stack>
      <Box mt="xs">
        <Text span size="sm" c="dimmed">
          Selected item:{' '}
        </Text>
        <Text span size="sm">
          {selectedItem || 'Nothing selected'}
        </Text>
      </Box>
      <Combobox
        size="md"
        store={combobox}
        width={250}
        position="bottom-start"
        withArrow
        withinPortal={false}
        onOptionSubmit={(val) => {
          setSelectedItem(val);
          combobox.closeDropdown();
        }}
      >
        {/* TODO: add label, placeholder, and indicate selected option in dropdown */}
        <VisynSelectTarget selectFirstOptionOnChange size="xs" combobox={combobox} data={data} value={selectedItem} onChange={setSelectedItem} clearable />

        <VisynOptionsDropdown
          renderOption={({ option }) => {
            return (
              <VisynOption
                label={option.label}
                value={option.value}
                // TODO: this is a workaround and needs to be fixed in the typings of the component
                icon={groceries.find((g) => g.value === option.value)?.emoji}
                description={groceries.find((g) => g.value === option.value)?.description}
              />
            );
          }}
          data={groceries.map((g) => ({ label: g.value, value: g.value })) as OptionsData}
          maxDropdownHeight={undefined}
        />
      </Combobox>
    </Stack>
  );
}
