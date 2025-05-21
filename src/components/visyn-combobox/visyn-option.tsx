import * as React from 'react';

import { Badge, ComboboxItem, Group, Highlight } from '@mantine/core';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
  checked?: boolean;
  search?: string;
}
// TODO: implement withCheckIcon
// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon, checked, search = '' }: React.PropsWithChildren<VisynOptionProps>) {
  return (
    <Group gap="xs" wrap="nowrap" style={{ flexGrow: 1 }}>
      {icon}
      <div style={{ width: '100%' }}>
        <Highlight inherit highlight={search}>
          {label}
        </Highlight>

        {description && (
          <Highlight inherit c="dimmed" highlight={search}>
            {description}
          </Highlight>
        )}
      </div>
      <Badge>Test</Badge>
    </Group>
  );
}
