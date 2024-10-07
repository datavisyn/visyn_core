import { Alert, Center, Stack, rem, Overlay } from '@mantine/core';
import * as React from 'react';

export function InvalidCols({ headerMessage, bodyMessage }: { headerMessage: string; bodyMessage: string }) {
  return (
    <Stack h="100%">
      <Center h="100%">
        <Alert title={headerMessage} color="yellow">
          {bodyMessage}
        </Alert>
      </Center>
    </Stack>
  );
}
