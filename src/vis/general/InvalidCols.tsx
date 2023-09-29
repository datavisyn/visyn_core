import { Alert, Center, Stack, rem } from '@mantine/core';
import * as React from 'react';

export function InvalidCols({ headerMessage, bodyMessage }: { headerMessage: string; bodyMessage: string }) {
  return (
    <Stack style={{ height: '100%' }}>
      <Center style={{ height: '100%', width: '100%' }}>
        <Alert title={headerMessage} color="yellow" miw={rem(420)}>
          {bodyMessage}
        </Alert>
      </Center>
    </Stack>
  );
}
