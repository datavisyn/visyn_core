import { Alert, Center, Stack } from '@mantine/core';
import * as React from 'react';

export function InvalidCols({ headerMessage, bodyMessage, style }: { headerMessage: string; bodyMessage: string; style: React.CSSProperties }) {
  return (
    <Stack h="100%" style={style}>
      <Center h="100%">
        <Alert title={headerMessage} color="yellow">
          {bodyMessage}
        </Alert>
      </Center>
    </Stack>
  );
}
