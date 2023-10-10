import { CheckIcon, CloseButton, Combobox, Group, MultiSelect, Pill, PillsInput, useCombobox } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

interface CategoricalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}

function Test({ data }: { data: { value: string; label: string; description: string }[] }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = React.useState<string[]>([]);

  const handleValueSelect = (val: string) => setValue((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]));

  const handleValueRemove = (val: string) => setValue((current) => current.filter((v) => v !== val));

  const values = value.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  const options = data.map((item) => (
    <Combobox.Option value={item.value} key={item.value} active={value.includes(item.value)}>
      <Group gap="sm">
        {value.includes(item.value) ? <CheckIcon size={12} /> : null}
        <span>{item.value}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.Target>
        <PillsInput
          label="Categorical columns"
          rightSection={
            value.length > 0 ? <CloseButton size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => setValue([])} /> : <Combobox.Chevron />
          }
          onClick={() => combobox.openDropdown()}
        >
          <Pill.Group>{values}</Pill.Group>
        </PillsInput>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export function CategoricalColumnSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => ({ value: c.info.id, label: c.info.name, description: c.info.description }));
  }, [columns]);

  // @TODO @MORITZ
  // valueComponent={SelectLabelComponent}
  // itemComponent={SelectDropdownItem}

  return (
    <>
      <Test data={selectCatOptions} />
      <MultiSelect
        placeholder="Select columns"
        label="Categorical columns"
        clearable
        onChange={(e) => callback(e.map((id) => columns.find((c) => c.info.id === id).info))}
        name="numColumns"
        data={selectCatOptions}
        value={currentSelected.map((c) => c.id)}
      />
    </>
  );
}
