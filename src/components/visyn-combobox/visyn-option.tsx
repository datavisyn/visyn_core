import * as React from 'react';

import { Badge, ComboboxItem, Group, Highlight, MantineSize } from '@mantine/core';

export interface VisynOptionProps extends ComboboxItem {
  description?: string;
  icon?: React.ReactNode;
  checked?: boolean;
  search?: string;
  size?: MantineSize;
  badgeLabel?: string;
}
// TODO: implement disabled state
export function VisynOption({ label, description, disabled, icon, checked, search = '', size, badgeLabel }: React.PropsWithChildren<VisynOptionProps>) {
  // width: 0 is required in display: table to make truncate work
  return (
    <Group gap="xs" wrap="nowrap" style={{ width: 0, flexGrow: 1 }}>
      {icon}
      <div style={{ width: 0, flexGrow: 1 }}>
        <Highlight inherit highlight={search} truncate w="100%">
          {label}
        </Highlight>

        {description && (
          <Highlight inherit c="dimmed" highlight={search} truncate w="100%">
            {description}
          </Highlight>
        )}
      </div>
      {badgeLabel && (
        <Badge size={size} style={{ flexShrink: 0 }}>
          {badgeLabel}
        </Badge>
      )}
    </Group>
  );
}
