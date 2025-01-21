import React from 'react';

import { css } from '@emotion/css';
import { ColorSwatch, Group, Text } from '@mantine/core';

import { getLabelOrUnknown } from './utils';

/**
 * Generic legend item partially copied from mantine.
 */
export function LegendItem({ color, label, filtered, onClick }: { color: string; label: string; filtered: boolean; onClick?: () => void }) {
  return (
    <Group
      key={label}
      wrap="nowrap"
      className={css`
        gap: 7px;
        padding: 7px 10px;
        user-select: none;
        border-radius: 0.25rem;
        &:hover {
          background-color: #f9f9f9;
        }
        cursor: pointer;
      `}
      onClick={onClick}
      opacity={filtered ? 0.6 : 1}
    >
      <ColorSwatch color={color} size={12} withShadow={false} />

      <Text size="sm" m={0} p={0} lh={1.1} truncate td={filtered ? 'line-through' : 'none'}>
        {getLabelOrUnknown(label)}
      </Text>
    </Group>
  );
}
