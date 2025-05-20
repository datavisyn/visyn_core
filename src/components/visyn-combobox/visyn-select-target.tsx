import * as React from 'react';

import { Combobox, ComboboxStore, InputBase, MantineSize, OptionsData } from '@mantine/core';

export function VisynSelectTarget({
  autoComplete,
  id,
  data,
  value,
  onChange,
  combobox,
  readOnly,
  onClear,
  rightSectionPointerEvents,
  selectFirstOptionOnChange,
  disabled,
  size,
  error,
  clearable,
  label,
  placeholder,
}: {
  autoComplete?: string;
  id?: string;
  data: OptionsData;
  value?: string | null;
  combobox: ComboboxStore;
  onChange: (value: string | null) => void;
  onClear?: () => void;
  readOnly?: boolean;
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  selectFirstOptionOnChange?: boolean;
  disabled?: boolean;
  size?: MantineSize;
  error?: React.ReactNode;
  clearable?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const clearButton = (
    <Combobox.ClearButton
      onClear={() => {
        onChange(null);
        onClear?.();
      }}
    />
  );

  const isClearable = clearable && !!value && !disabled && !readOnly;

  React.useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
  }, [selectFirstOptionOnChange, combobox]);

  return (
    <Combobox.Target targetType="button" autoComplete={autoComplete}>
      <InputBase
        id={id}
        __defaultRightSection={<Combobox.Chevron size={size} error={error} />}
        __clearSection={clearButton}
        __clearable={isClearable}
        // rightSection={rightSection}
        rightSectionPointerEvents={rightSectionPointerEvents || (isClearable ? 'all' : 'none')}
        // {...others}
        size={size}
        __staticSelector="Select"
        disabled={disabled}
        readOnly
        value={value ?? ''}
        onChange={() => {
          combobox.openDropdown();
          selectFirstOptionOnChange && combobox.selectFirstOption();
        }}
        onClick={() => {
          combobox.toggleDropdown();
        }}
        pointer
        error={error}
        label={label}
        placeholder={placeholder}
      />
    </Combobox.Target>
  );
}
