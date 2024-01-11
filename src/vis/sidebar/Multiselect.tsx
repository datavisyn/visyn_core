import { CloseButton, Combobox, Input, Pill, PillsInput, Stack, Tooltip, useCombobox, Text } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

export function Multiselect({
  callback,
  columns,
  currentSelected,
  columnType,
}: {
  callback: (value: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
  columnType: EColumnTypes;
}) {
  const filteredColumns = React.useMemo(() => {
    return columns.filter((c) => c.type === columnType);
  }, [columnType, columns]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueSelect = (name: string) => {
    const itemToAdd = filteredColumns.find((c) => c.info.name === name);
    callback([...currentSelected, itemToAdd.info]);
  };

  const handleValueRemove = (id: string) => {
    callback(currentSelected.filter((s) => s.id !== id));
  };

  const handleValueRemoveAll = () => {
    callback([]);
  };

  const options = filteredColumns
    .filter((c) => !currentSelected.map((s) => s.id).includes(c.info.id))
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

  const values = currentSelected.map((item) => (
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
          label={`${columnType} columns`}
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
                    handleValueRemove(currentSelected[currentSelected.length - 1].id);
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
