import React from 'react';

import { Combobox, ComboboxStore, InputBase, MantineSize } from '@mantine/core';

export function DVSelectTarget({
  combobox,
  clearable,
  error,
  size,
  searchable,
  value,
  setValue,
  search,
  setSearch,
  disabled,
  readOnly,
  selectFirstOptionOnChange,
  onClear,
}: {
  combobox: ComboboxStore;
  clearable?: boolean;
  error?: React.ReactNode;
  size?: MantineSize;
  searchable?: boolean;
  value?: string | null;
  setValue?: (value: string | null) => void;
  search?: string;
  setSearch?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  selectFirstOptionOnChange?: boolean;
  onClear?: () => void;
}) {
  const isClearable = clearable && !!value && !disabled && !readOnly;

  const handleSearchChange = (searchValue: string) => {
    setSearch?.(searchValue);
    combobox.resetSelectedOption();
  };

  const clearButton = (
    <Combobox.ClearButton
      onClear={() => {
        setValue?.(null, null);
        handleSearchChange('');
        onClear?.();
      }}
    />
  );

  return (
    <Combobox.Target targetType={searchable ? 'input' : 'button'}>
      <InputBase
        __defaultRightSection={<Combobox.Chevron size={size} error={error} />}
        __clearSection={clearButton}
        __clearable={isClearable}
        size={size}
        __staticSelector="Select"
        disabled={disabled}
        readOnly={readOnly || !searchable}
        value={search}
        onChange={(event) => {
          handleSearchChange(event.currentTarget.value);
          combobox.openDropdown();
          selectFirstOptionOnChange && combobox.selectFirstOption();
        }}
        onFocus={(event) => {
          searchable && combobox.openDropdown();
          // onFocus?.(event);
        }}
        onBlur={(event) => {
          searchable && combobox.closeDropdown();
          handleSearchChange('');
          // onBlur?.(event);
        }}
        onClick={(event) => {
          searchable ? combobox.openDropdown() : combobox.toggleDropdown();
          // onClick?.(event);
        }}
        pointer={!searchable}
        error={error}
      />
    </Combobox.Target>
  );
}
