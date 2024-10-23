import * as React from 'react';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Center, Stack } from '@mantine/core';

export function InvalidCols({ headerMessage, bodyMessage, style }: { headerMessage?: string; bodyMessage: string; style?: React.CSSProperties }) {
  return (
    <Stack h="100%" style={style}>
      <Center h="100%">
        <Alert title={headerMessage} variant="light" color="yellow" icon={<FontAwesomeIcon icon={faExclamationCircle} />}>
          {bodyMessage}
        </Alert>
      </Center>
    </Stack>
  );
}
