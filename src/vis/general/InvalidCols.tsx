import * as React from 'react';
import { Center, Stack } from '@mantine/core';
import { WarningMessage } from './WarningMessage';

export function InvalidCols({ headerMessage, bodyMessage, style }: { headerMessage?: string; bodyMessage: string; style?: React.CSSProperties }) {
  return (
    <Stack h="100%" style={style}>
      <Center h="100%">
        <WarningMessage title={headerMessage}>{bodyMessage}</WarningMessage>
      </Center>
    </Stack>
  );
}
