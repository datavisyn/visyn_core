import * as React from 'react';

import { CheckIcon, ComboboxItem, Group, Text } from '@mantine/core';

import { optionsDropdownCheckIcon } from './styles';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
  checked?: boolean;
}

// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon, checked }: React.PropsWithChildren<VisynOptionProps>) {
  const check = checked && <CheckIcon className={optionsDropdownCheckIcon} />;
  return (
    <Group gap="sm" wrap="nowrap">
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
