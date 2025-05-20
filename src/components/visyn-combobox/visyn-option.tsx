import * as React from 'react';

import { CheckIcon, ComboboxItem, Group, Text } from '@mantine/core';

import { optionsDropdownCheckIcon } from './styles';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
  checked?: boolean;
}
// TODO: implement withCheckIcon
// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon, checked }: React.PropsWithChildren<VisynOptionProps>) {
  const check = <CheckIcon className={optionsDropdownCheckIcon} style={{ visibility: checked ? 'visible' : 'hidden' }} />;
  return (
    <Group gap="xs" wrap="nowrap">
      {/* TODO: icon does not scale with mantine size */}
      {check}
      <Text>{icon}</Text>
      <div>
        <Text inherit>{label}</Text>
        {description && (
          <Text inherit c="dimmed">
            {description}
          </Text>
        )}
      </div>
    </Group>
  );
}
