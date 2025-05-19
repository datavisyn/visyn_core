import * as React from 'react';

import { ComboboxItem, Group, Text } from '@mantine/core';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
}

// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon }: React.PropsWithChildren<VisynOptionProps>) {
  return (
    <Group gap="sm" wrap="nowrap">
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
