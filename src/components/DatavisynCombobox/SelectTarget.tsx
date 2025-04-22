import * as React from 'react';

import { Combobox, ComboboxStore, Input, InputBase, InputBaseProps, MantineSize } from '@mantine/core';

export interface ComboboxTargetProps {
  label?: string;
  clearable?: boolean;
  combobox: ComboboxStore;
  onClear?: () => void;
  placeholder?: string;
  inputBaseProps?: InputBaseProps;
  size?: MantineSize;
  value?: string | null;
  setValue?: (value: string | null) => void;
  readOnly?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  search?: string;
  setSearch?: (value: string) => void;
  selectFirstOptionOnChange?: boolean;
}

export function DatavisynComboboxTarget({
  children,
  label,
  clearable,
  combobox,
  onClear,
  placeholder,
  inputBaseProps,
  size = 'xs',
  readOnly,
  value,
  setValue,
  searchable,
  disabled,
  error,
  search,
  setSearch,
  selectFirstOptionOnChange,
}: React.PropsWithChildren<ComboboxTargetProps>) {
  const isClearable = clearable && Boolean(value) && !disabled && !readOnly;

  const handleSearchChange = (searchValue: string) => {
    setSearch?.(searchValue);
    combobox.resetSelectedOption();
  };

  const clearButton = (
    <Combobox.ClearButton
      onClear={() => {
        setValue(null);
        handleSearchChange('');
        onClear?.();
      }}
    />
  );

  return (
    <Combobox.Target>
      <InputBase
        label={label}
        component="button"
        maw={300}
        type="button"
        multiline
        rightSectionPointerEvents={clearable ? 'all' : 'none'}
        __defaultRightSection={<Combobox.Chevron size={size} error={error} />}
        __clearSection={clearButton}
        __clearable={isClearable}
        size={size}
        __staticSelector="Select"
        disabled={disabled}
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
        {...inputBaseProps}
      >
        {children || <Input.Placeholder>{placeholder}</Input.Placeholder>}
      </InputBase>
    </Combobox.Target>
  );
}
