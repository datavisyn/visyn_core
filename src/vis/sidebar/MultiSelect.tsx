import { CloseButton, Combobox, Input, Pill, PillsInput, Stack, Tooltip, useCombobox, Text, Group, ScrollArea } from '@mantine/core';
import * as React from 'react';
import { css } from '@emotion/css';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

export function MultiSelect({
  callback,
  columns,
  currentSelected,
  columnType = null,
  label = '',
}: {
  callback: (value: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
  columnType?: EColumnTypes;
  label?: string;
}) {
  const filteredColumns = React.useMemo(() => {
    return columns.filter((c) => (columnType ? c.type === columnType : true));
  }, [columnType, columns]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const handleValueRemove = (id: string) => {
    callback(currentSelected.filter((s) => s.id !== id));
  };

  const handleValueSelect = (id: string) => {
    const itemToAdd = filteredColumns.find((c) => c.info.id === id);
    currentSelected.find((c) => c.id === id) ? handleValueRemove(itemToAdd.info.id) : callback([...currentSelected, itemToAdd.info]);
  };

  const handleValueRemoveAll = () => {
    callback([]);
  };

  const options = filteredColumns
    .filter((c) => !currentSelected.map((s) => s.id).includes(c.info.id))
    .map((item) => {
      return (
        <Combobox.Option value={item.info.id} key={item.info.id}>
          <Tooltip
            withinPortal
            withArrow
            arrowSize={6}
            label={
              <Stack gap={0}>
                <Text size="xs">{item.info.name}</Text>
                <Text size="xs" c="dimmed">
                  {item.info.description}
                </Text>
              </Stack>
            }
          >
            <Group gap="xs">
              {currentSelected.map((c) => c.id).includes(item.info.id)}
              <Stack gap={0}>
                <Text size="sm">{item.info.name}</Text>
                <Text size="xs" c="dimmed">
                  {item.info.description}
                </Text>
              </Stack>
            </Group>
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
          <Text size="xs" c="dimmed">
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
        h={item.description ? 35 : 20}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Stack gap={0}>
          <Text lh={1.2} size="xs" truncate pt={item.description ? 4 : 3}>
            {item.name}
          </Text>
          {item.description ? (
            <Text lh={1.2} size="xs" c="dimmed" truncate>
              {item.description}
            </Text>
          ) : null}
        </Stack>
      </Pill>
    </Tooltip>
  ));

  return (
    <Combobox data-testid="MultiSelect" store={combobox} onOptionSubmit={handleValueSelect} withinPortal>
      <Combobox.DropdownTarget>
        <PillsInput
          className={css`
            .mantine-Input-section.mantine-PillsInput-section[data-position='right'] {
              /* This is necessary for the "x" (delete) to not be 100% height and centered so that users can click below to open the dropdown */
              height: 22px;
              margin-top: auto;
              margin-bottom: auto;
            }
          `}
          rightSection={
            <CloseButton
              data-testid="MultiSelectCloseButton"
              onMouseDown={handleValueRemoveAll}
              color="gray"
              variant="transparent"
              size={22}
              iconSize={12}
              tabIndex={-1}
            />
          }
          label={!label ? `${columnType} columns` : label}
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
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={200}>
            {options.length === 0 ? <Combobox.Empty>All options selected</Combobox.Empty> : options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
