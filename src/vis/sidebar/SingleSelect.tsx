import { Combobox, Input, useCombobox, InputBase, Group, CheckIcon, Text } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

export function SingeSelect({
  callback,
  columns,
  currentSelected,
  columnType,
  label,
}: {
  callback: (value: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
  /** If null, all columns are selectable */
  columnType: EColumnTypes | null;
  label: string;
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
      <Group gap="xs">
        {item.info.id === currentSelected?.id && (
          <Text c="gray.6">
            <CheckIcon size={12} />
          </Text>
        )}
        <span>{item.info.name}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        callback(filteredColumns.find((c) => c.info.name === val)?.info);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          label={label}
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {currentSelected?.name || <Input.Placeholder>Select a column</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
