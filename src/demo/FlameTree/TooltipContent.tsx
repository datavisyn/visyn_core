import * as React from 'react';

import { css } from '@emotion/css';
import { Text } from '@mantine/core';

import { FlameBin } from './math';

export function TooltipContentBin<V extends Record<string, unknown>>({ bin }: { bin: FlameBin<V> }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: 16,
      }}
      // Select each second element and make it bold
      className={css`
        & > :nth-child(2n + 1) {
          font-weight: bold;
        }
      `}
    >
      {Object.entries(bin.value).map(([key, value]) => {
        return (
          <React.Fragment key={key}>
            <Text inherit>{key}</Text>
            <Text truncate inherit>
              {value as string}
            </Text>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function TooltipContent({ row, layering }: { row: Record<string, unknown>; layering: string[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: 16,
      }}
      // Select each second element and make it bold
      className={css`
        & > :nth-child(2n + 1) {
          font-weight: bold;
        }
      `}
    >
      {layering.map((key) => {
        return (
          <React.Fragment key={key}>
            <Text inherit>{key}</Text>
            <Text truncate inherit>
              {row[key] as string}
            </Text>
          </React.Fragment>
        );
      })}
    </div>
  );
}
