import * as React from 'react';

import { Combobox, ComboboxLikeRenderOptionInput, ComboboxParsedItem, Input, MantineSize, OptionsFilter, getOptionsLockup, useCombobox } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

import { VisynOptionsDropdown } from './visyn-options-dropdown';
import { VisynSelectTarget } from './visyn-select-target';

export function VisynSelect<D extends ComboboxParsedItem>({
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
  onOptionSubmit,
  allowDeselect = false,
  size,
}: {
  data: D[];
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
  filter?: OptionsFilter;
  searchable?: boolean;
  withScrollArea?: boolean;
  maxDropdownHeight?: number | string;
  renderOption?: (input: ComboboxLikeRenderOptionInput<D>) => React.ReactNode;
  placeholder?: string;
  onOptionSubmit?: (value: string) => void;
  allowDeselect?: boolean;
  size?: MantineSize;
}) {
  // const parsedData = React.useMemo(() => getParsedComboboxData(data), [data]);
  const optionsLockup = React.useMemo(() => getOptionsLockup(data), [data]);
  const _id = React.useId();

  const [internalValue, setInternalValue, controlled] = useUncontrolled({
    value,
    defaultValue: null,
    finalValue: null,
    onChange,
  });

  const selectedOption = typeof internalValue === 'string' ? optionsLockup[internalValue] : undefined;

  console.log('selectedOption', selectedOption);

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

  const _clearable = clearable && !!internalValue && !disabled && !readOnly;

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
    >
      <VisynSelectTarget
        id={_id}
        data={data}
        value={internalValue}
        onChange={setInternalValue}
        combobox={combobox}
        readOnly={readOnly}
        onClear={onClear}
        selectFirstOptionOnChange={selectFirstOptionOnChange}
        disabled={disabled}
        clearable={_clearable}
        placeholder={placeholder}
        size={size}
      >
        {selectedOption ? renderOption?.({ option: selectedOption, checked: false, size }) : <Input.Placeholder>{placeholder}</Input.Placeholder>}
      </VisynSelectTarget>

      <VisynOptionsDropdown
        data={data}
        hidden={readOnly || disabled}
        filter={filter}
        searchValue={search}
        onSearchChange={handleSearchChange}
        limit={limit}
        withScrollArea={withScrollArea}
        maxDropdownHeight={maxDropdownHeight}
        value={internalValue}
        nothingFoundMessage={nothingFoundMessage}
        labelId={`${_id}-label`}
        renderOption={renderOption}
        searchable={searchable}
      />
    </Combobox>
  );
}
