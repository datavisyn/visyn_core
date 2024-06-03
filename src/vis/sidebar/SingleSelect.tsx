import { Box, CheckIcon, CloseButton, Combobox, Group, Input, InputBase, ScrollArea, Stack, Text, Tooltip, useCombobox } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

export function SingleSelect({
  callback,
  columns,
  currentSelected,
  columnTypes,
  label,
  isClearable = true,
  disabled = false,
}: {
  callback: (value: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
  /** If null, all columns are selectable */
  columnTypes: EColumnTypes[] | null;
  label: string;
  isClearable?: boolean;
  disabled?: boolean;
}) {
  const filteredColumns = React.useMemo(() => {
    return columnTypes ? columns.filter((c) => columnTypes.includes(c.type)) : columns;
  }, [columnTypes, columns]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const options = filteredColumns.map((item) => (
    <Combobox.Option value={item.info.id} key={item.info.id} active={item.info.id === currentSelected?.id}>
      <Tooltip
        withinPortal
        withArrow
        arrowSize={6}
        maw={240}
        label={
          <Stack gap={0}>
            <Text size="xs">{item.info.name}</Text>
            <Text size="xs" c="dimmed" style={{ textWrap: 'wrap' }}>
              {item.info.description}
            </Text>
          </Stack>
        }
      >
        <Group gap="xs" wrap="nowrap">
          {item.info.id === currentSelected?.id && (
            <Text c="gray.6">
              <CheckIcon size={12} />
            </Text>
          )}
          <Stack gap={0}>
            <Box style={{ display: 'table', tableLayout: 'fixed', width: '100%' }}>
              <Text size="sm" style={{ cursor: 'pointer', display: 'table-cell', lineHeight: 'normal' }} truncate>
                {item.info.name}
              </Text>
            </Box>
            <Box style={{ display: 'table', tableLayout: 'fixed', width: '100%' }}>
              <Text size="xs" style={{ cursor: 'pointer', display: 'table-cell', lineHeight: 'normal' }} truncate opacity={0.5}>
                {item.info.description}
              </Text>
            </Box>
          </Stack>
        </Group>
      </Tooltip>
    </Combobox.Option>
  ));

  return (
    <Tooltip
      key={currentSelected?.id}
      withinPortal
      withArrow
      arrowSize={6}
      label={
        <Stack gap={0}>
          <Text size="xs">{currentSelected?.name}</Text>
          <Text size="xs" c="dimmed">
            {currentSelected?.description}
          </Text>
        </Stack>
      }
      disabled={!currentSelected}
    >
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          // NOTE: @dv-usama-ansari: For bar charts, the `id` is used to find the matching column.
          //  This needs to be checked for other vis.
          callback(filteredColumns.find((c) => c.info.id === val)?.info);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            label={label}
            type="button"
            pointer
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents={currentSelected === null ? 'none' : 'all'}
            rightSection={
              currentSelected !== null && isClearable ? (
                <CloseButton size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => callback(null)} aria-label="Clear value" />
              ) : (
                <Combobox.Chevron />
              )
            }
            disabled={disabled}
          >
            {currentSelected?.name || <Input.Placeholder>Select a column</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <ScrollArea.Autosize type="scroll" mah={200}>
            <Combobox.Options>{options}</Combobox.Options>
          </ScrollArea.Autosize>
        </Combobox.Dropdown>
      </Combobox>
    </Tooltip>
  );
}
