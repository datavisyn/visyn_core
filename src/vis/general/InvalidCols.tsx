import * as React from 'react';
import { Alert, Center, Stack } from '@mantine/core';
import { WarningMessage } from './WarningMessage';

export function InvalidCols({
  title,
  children,
  style,
  alertProps,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  alertProps?: React.ComponentProps<typeof Alert>;
}) {
  return (
    <Stack h="100%" style={style}>
      <Center h="100%">
        <WarningMessage title={title} alertProps={alertProps}>
          {children}
        </WarningMessage>
      </Center>
    </Stack>
  );
}
