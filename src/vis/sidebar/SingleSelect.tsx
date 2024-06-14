import { CheckIcon, CloseButton, Combobox, Group, Input, InputBase, ScrollArea, Text, Tooltip, useCombobox } from '@mantine/core';
import * as React from 'react';
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
  columnType: EColumnTypes | null;
  label: string;
  isClearable?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const filteredColumns = React.useMemo(() => {
    return columnType ? columns.filter((c) => c.type === columnType) : columns;
  }, [columnType, columns]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const options = filteredColumns.map((item) => (
    <Combobox.Option value={item.info.name} key={item.info.id} active={item.info.id === currentSelected?.id}>
      <Tooltip label={item.info.name} position="left" withArrow>
        <Group gap="xs" wrap="nowrap">
          {item.info.id === currentSelected?.id && (
            <Text c="gray.6">
              <CheckIcon size={12} />
            </Text>
          )}
          <Text size="sm" truncate maw={120}>
            {item.info.name}
          </Text>
        </Group>
      </Tooltip>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(val) => {
        callback(filteredColumns.find((c) => c.info.name === val)?.info);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Tooltip label={disabledTooltip} disabled={!disabled} withArrow>
          <InputBase
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
                <CloseButton size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => callback(null)} aria-label="Clear value" />
              ) : (
                <Combobox.Chevron />
              )
            }
          >
            {currentSelected?.name ? (
              <Text size="sm" truncate maw={120}>
                {currentSelected?.name}
              </Text>
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
