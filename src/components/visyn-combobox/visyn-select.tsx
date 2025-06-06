import * as React from 'react';

import {
  Combobox,
  ComboboxLikeRenderOptionInput,
  ComboboxProps,
  ComboboxSearchProps,
  Group,
  Input,
  MantineSize,
  getOptionsLockup,
  useCombobox,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

import { defaultVisynOptionsFilter } from './default-visyn-options-filter';
import { VisynComboboxItem, VisynComboboxParsedItem, VisynOptionsFilter } from './interfaces';
import { VisynOptionsDropdown } from './visyn-options-dropdown';
import { VisynSelectTarget } from './visyn-select-target';

export interface VisynSelectProps<Data extends VisynComboboxParsedItem> {
  data: Data[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onDropdownClose?: () => void;
  onDropdownOpen?: () => void;
  dropdownOpened?: boolean;
  selectFirstOptionOnChange?: boolean;
  onClear?: () => void;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  limit?: number;
  nothingFoundMessage?: React.ReactNode;
  filter?: VisynOptionsFilter<Data>;
  searchable?: boolean;
  withScrollArea?: boolean;
  maxDropdownHeight?: number | string;
  renderOption?: (input: ComboboxLikeRenderOptionInput<Data> & { searchValue?: string }) => React.ReactNode;
  placeholder?: string;
  label?: React.ReactNode;
  onOptionSubmit?: (value: string) => void;
  allowDeselect?: boolean;
  size?: MantineSize;
  comboboxSearchProps?: ComboboxSearchProps;
  comboboxProps?: ComboboxProps;
}

export function VisynSelect<Data extends VisynComboboxParsedItem>({
  data,
  value,
  onChange,
  searchValue,
  onSearchChange,
  onDropdownClose,
  onDropdownOpen,
  dropdownOpened,
  selectFirstOptionOnChange = true,
  onClear,
  clearable,
  disabled,
  readOnly,
  limit,
  nothingFoundMessage,
  filter,
  searchable = true,
  withScrollArea,
  maxDropdownHeight,
  renderOption,
  placeholder,
  label,
  onOptionSubmit,
  allowDeselect = false,
  size,
  comboboxSearchProps,
  comboboxProps,
}: VisynSelectProps<Data>) {
  // This cast is necessary because its a mantine internal function
  const optionsLockup = React.useMemo(() => getOptionsLockup(data), [data]) as Record<string, VisynComboboxItem>;
  const uniqueId = React.useId();

  const [internalValue, setInternalValue, controlled] = useUncontrolled({
    value,
    defaultValue: null,
    finalValue: null,
    onChange,
  });

  const selectedOption = typeof internalValue === 'string' ? optionsLockup[internalValue] : undefined;

  const [search, setSearch] = useUncontrolled({
    value: searchValue,
    defaultValue: '',
    finalValue: selectedOption ? selectedOption.label : '',
    onChange: onSearchChange,
  });

  const combobox = useCombobox({
    opened: dropdownOpened,
    onDropdownOpen: () => {
      onDropdownOpen?.();
      combobox.resetSelectedOption();
      combobox.focusSearchInput();
    },
    onDropdownClose: () => {
      onDropdownClose?.();
      setSearch('');
      combobox.resetSelectedOption();
      combobox.focusTarget();
    },
  });

  const handleSearchChange = (newValue: string) => {
    setSearch(newValue);
    combobox.resetSelectedOption();
  };

  // Selects the first option after the user has typed a search term
  React.useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
    // Copied from mantine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFirstOptionOnChange, search]);

  const isClearable = clearable && !!internalValue && !disabled && !readOnly;

  return (
    <Combobox
      store={combobox}
      __staticSelector="Select"
      readOnly={readOnly}
      onOptionSubmit={(val) => {
        onOptionSubmit?.(val);
        const optionLockup = allowDeselect ? (optionsLockup[val]!.value === internalValue ? null : optionsLockup[val]) : optionsLockup[val];

        const nextValue = optionLockup ? optionLockup.value : null;

        nextValue !== internalValue && setInternalValue(nextValue, optionLockup);
        !controlled && handleSearchChange(typeof nextValue === 'string' ? optionLockup?.label || '' : '');

        combobox.closeDropdown();
      }}
      size={size}
      {...comboboxProps}
    >
      <VisynSelectTarget
        id={uniqueId}
        value={internalValue}
        onChange={setInternalValue}
        combobox={combobox}
        readOnly={readOnly}
        onClear={onClear}
        disabled={disabled}
        clearable={isClearable}
        label={label}
        size={size}
      >
        {selectedOption ? (
          // pr aligns the label properly with the options
          <Group w="100%" wrap="nowrap" pr="0.7em">
            {/* @ts-ignore */}
            {renderOption?.({ option: selectedOption, checked: false, size })}
          </Group>
        ) : (
          <Input.Placeholder>{placeholder}</Input.Placeholder>
        )}
      </VisynSelectTarget>

      <VisynOptionsDropdown
        data={data}
        hidden={readOnly || disabled}
        filter={filter || defaultVisynOptionsFilter}
        searchValue={search}
        onSearchChange={handleSearchChange}
        limit={limit}
        withScrollArea={withScrollArea}
        maxDropdownHeight={maxDropdownHeight}
        value={internalValue}
        nothingFoundMessage={nothingFoundMessage}
        labelId={`${uniqueId}-label`}
        renderOption={renderOption}
        searchable={searchable}
        comboboxSearchProps={comboboxSearchProps}
      />
    </Combobox>
  );
}
