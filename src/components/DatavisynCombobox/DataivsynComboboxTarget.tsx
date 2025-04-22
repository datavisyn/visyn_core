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
}: React.PropsWithChildren<ComboboxTargetProps>) {
  return (
    <Combobox.Target>
      <InputBase
        size={size}
        label={label}
        component="button"
        maw={300}
        type="button"
        pointer
        __clearable={clearable}
        __clearSection={<Combobox.ClearButton onClear={() => onClear?.()} />}
        __defaultRightSection={<Combobox.Chevron size={size} />}
        multiline
        onClick={() => combobox.toggleDropdown()}
        rightSectionPointerEvents={clearable ? 'all' : 'none'}
        {...inputBaseProps}
      >
        {children || <Input.Placeholder>{placeholder}</Input.Placeholder>}
      </InputBase>
    </Combobox.Target>
  );
}
