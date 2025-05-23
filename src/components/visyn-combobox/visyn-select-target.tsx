import * as React from 'react';

import { Combobox, ComboboxStore, InputBase, MantineSize } from '@mantine/core';

export function VisynSelectTarget({
  autoComplete,
  id,
  value,
  onChange,
  combobox,
  readOnly,
  onClear,
  rightSectionPointerEvents,
  disabled,
  size,
  error,
  clearable,
  children,
  label,
}: React.PropsWithChildren<{
  autoComplete?: string;
  id?: string;
  value?: string | null;
  combobox: ComboboxStore;
  onChange: (value: string | null) => void;
  onClear?: () => void;
  readOnly?: boolean;
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  disabled?: boolean;
  size?: MantineSize;
  error?: React.ReactNode;
  clearable?: boolean;
  label?: string;
}>) {
  const clearButton = (
    <Combobox.ClearButton
      onClear={() => {
        onChange(null);
        onClear?.();
      }}
    />
  );

  const isClearable = clearable && !!value && !disabled && !readOnly;

  return (
    <Combobox.Target targetType="button" autoComplete={autoComplete}>
      <InputBase
        id={id}
        component="button"
        __defaultRightSection={<Combobox.Chevron size={size} error={error} />}
        __clearSection={clearButton}
        __clearable={isClearable}
        // rightSection={rightSection}
        rightSectionPointerEvents={rightSectionPointerEvents || (isClearable ? 'all' : 'none')}
        // {...others}
        multiline
        size={size}
        __staticSelector="Select"
        disabled={disabled}
        value={value ?? ''}
        onClick={() => {
          combobox.toggleDropdown();
        }}
        pointer
        error={error}
        label={label}
      >
        {children}
      </InputBase>
    </Combobox.Target>
  );
}
