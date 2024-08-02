import { CheckIcon, CloseButton, Combobox, Group, Stack, Input, InputBase, ScrollArea, Text, Tooltip, useCombobox } from '@mantine/core';
import * as React from 'react';
import { css } from '@emotion/css';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

export function SingleSelect({
  callback,
  columns,
  currentSelected,
  columnType,
  label,
  disabledTooltip,
  isClearable = true,
  disabled = false,
}: {
  callback: (value: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
  /** If null, all columns are selectable */
  columnType: EColumnTypes[] | null;
  label: string;
  isClearable?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const filteredColumns = React.useMemo(() => {
    return columnType ? columns.filter((c) => columnType.includes(c.type)) : columns;
  }, [columnType, columns]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const options = filteredColumns.map((item) => (
    <Combobox.Option value={item.info.id} key={item.info.id} active={item.info.id === currentSelected?.id}>
      <Tooltip
        label={
          <Stack gap={0}>
            <Text size="sm" truncate>
              {item.info?.name}
            </Text>
            <Text size="xs" truncate c="dimmed">
              {item.info?.description}
            </Text>
          </Stack>
        }
        position="left"
        withArrow
      >
        <Group gap="xs" wrap="nowrap">
          {item.info.id === currentSelected?.id && (
            <Text c="gray.6">
              <CheckIcon size={12} />
            </Text>
          )}
          <Stack gap={0} maw={120}>
            <Text size="sm" truncate>
              {item.info?.name}
            </Text>
            <Text size="xs" truncate c="dimmed">
              {item.info?.description}
            </Text>
          </Stack>
        </Group>
      </Tooltip>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(id) => {
        callback(filteredColumns.find((c) => c.info.id === id)?.info);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Tooltip label={disabledTooltip} disabled={!disabled} withArrow>
          <InputBase
            data-testid={`SingleSelect${label}`}
            className={css`
              button.mantine-Input-input.mantine-InputBase-input {
                height: 44px; // increase the height of the input to make some space for the description
              }
            `}
            component="button"
            label={
              <Text size="sm" fw={500} c={disabled ? 'dimmed' : 'black'}>
                {label}
              </Text>
            }
            disabled={disabled}
            type="button"
            pointer
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents={currentSelected === null ? 'none' : 'all'}
            rightSection={
              disabled ? null : currentSelected !== null && isClearable ? (
                <CloseButton
                  data-testid="SingleSelectCloseButton"
                  my={20}
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => callback(null)}
                  aria-label="Clear value"
                />
              ) : (
                <Combobox.Chevron />
              )
            }
          >
            {currentSelected?.name ? (
              <Stack gap={0} maw={120}>
                <Text lh={1.2} size="sm" truncate>
                  {currentSelected?.name}
                </Text>
                {currentSelected.description ? (
                  <Text lh={1.2} size="xs" truncate c="dimmed">
                    {currentSelected.description}
                  </Text>
                ) : null}
              </Stack>
            ) : (
              <Input.Placeholder>Select a column</Input.Placeholder>
            )}
          </InputBase>
        </Tooltip>
      </Combobox.Target>

      <Combobox.Dropdown>
        <ScrollArea.Autosize type="scroll" mah={200}>
          <Combobox.Options>{options}</Combobox.Options>
        </ScrollArea.Autosize>
      </Combobox.Dropdown>
    </Combobox>
  );
}
