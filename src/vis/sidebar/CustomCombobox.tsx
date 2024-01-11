import * as React from 'react';
import { Combobox, Input, Pill, PillsInput, Stack, Tooltip, useCombobox, Text, CloseButton } from '@mantine/core';
import { ColumnInfo, VisColumn } from '../interfaces';

export function CustomCombobox({ onChange, columns, selected }: { onChange: (value: ColumnInfo[]) => void; columns: VisColumn[]; selected: ColumnInfo[] }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    defaultOpened: true,
  });

  const handleValueSelect = (name: string) => {
    const itemToAdd = columns.find((c) => c.info.name === name);
    onChange([...selected, itemToAdd.info]);
  };

  const handleValueRemove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  const handleValueRemoveAll = () => {
    onChange([]);
  };

  const options = columns
    .filter((c) => !selected.map((s) => s.id).includes(c.info.id))
    .map((item) => {
      return (
        <Combobox.Option value={item.info.name} key={item.info.id}>
          <Tooltip
            withinPortal
            withArrow
            arrowSize={6}
            label={
              <Stack gap={0}>
                <Text size="xs">{item.info.name}</Text>
                <Text size="xs" color="dimmed">
                  {item.info.description}
                </Text>
              </Stack>
            }
          >
            <Stack gap={0}>
              <Text size="sm">{item.info.name}</Text>
              <Text size="xs" opacity={0.5}>
                {item.info.description}
              </Text>
            </Stack>
          </Tooltip>
        </Combobox.Option>
      );
    });

  const values = selected.map((item) => (
    <Tooltip
      key={item.id}
      withinPortal
      withArrow
      arrowSize={6}
      label={
        <Stack gap={0}>
          <Text size="xs">{item.name}</Text>
          <Text size="xs" color="dimmed">
            {item.description}
          </Text>
        </Stack>
      }
    >
      <Pill
        withRemoveButton
        onRemove={() => {
          handleValueRemove(item.id);
        }}
      >
        {item.name}
      </Pill>
    </Tooltip>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput
          rightSection={<CloseButton onMouseDown={handleValueRemoveAll} color="gray" variant="transparent" size={22} iconSize={12} tabIndex={-1} />}
          label="!Categorical columns"
          pointer
          onClick={() => combobox.toggleDropdown()}
        >
          <Pill.Group>
            {values.length > 0 ? values : <Input.Placeholder>Select columns</Input.Placeholder>}
            <Combobox.EventsTarget>
              <PillsInput.Field
                type="hidden"
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace') {
                    event.preventDefault();
                    handleValueRemove(selected[selected.length - 1].id);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>{options.length === 0 ? <Combobox.Empty>All options selected</Combobox.Empty> : options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
