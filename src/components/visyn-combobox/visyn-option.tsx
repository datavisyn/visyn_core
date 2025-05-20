import * as React from 'react';

import { CheckIcon, ComboboxItem, Group, Highlight, Text } from '@mantine/core';

import { optionsDropdownCheckIcon } from './styles';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
  checked?: boolean;
  search?: string;
}
// TODO: implement withCheckIcon
// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon, checked, search = '' }: React.PropsWithChildren<VisynOptionProps>) {
  const check = <CheckIcon className={optionsDropdownCheckIcon} style={{ visibility: checked ? 'visible' : 'hidden' }} />;
  return (
    <Group gap="xs" wrap="nowrap">
      {/* TODO: icon does not scale with mantine size */}
      {check}
      {icon}
      <div>
        <Text inherit>
          <Highlight inherit highlight={search}>
            {label}
          </Highlight>
        </Text>

        {description && (
          <Text inherit c="dimmed">
            <Highlight inherit highlight={search}>
              {description}
            </Highlight>
          </Text>
        )}
      </div>
    </Group>
  );
}
