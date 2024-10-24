import React from 'react';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Center, Stack } from '@mantine/core';

function Message({
  title,
  children,
  alertProps,
  dataTestId,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  alertProps?: React.ComponentProps<typeof Alert>;
  dataTestId?: string;
}) {
  return (
    <Alert title={title} variant="light" color="red" icon={<FontAwesomeIcon icon={faExclamationCircle} />} {...alertProps} data-test-id={dataTestId}>
      {children}
    </Alert>
  );
}

export function ErrorMessage({
  title,
  children,
  alertProps,
  dataTestId,
  centered,
  style,
}: {
  /**
   * Optional title for the message.
   */
  title?: React.ReactNode;
  /**
   * The content of the message.
   */
  children: React.ReactNode;
  /**
   * Props for the Mantine Alert component.
   */
  alertProps?: React.ComponentProps<typeof Alert>;
  /**
   * data-testid attribute for testing.
   */
  dataTestId?: string;
  /**
   * If true, the message will be centered in the parent container.
   */
  centered?: boolean;
  /**
   * If centered is true, style object for the container.
   */
  style?: React.CSSProperties;
}) {
  return centered ? (
    <Stack h="100%" style={style}>
      <Center h="100%">
        <Message title={title} alertProps={alertProps} dataTestId={dataTestId}>
          {children}
        </Message>
      </Center>
    </Stack>
  ) : (
    <Message title={title} alertProps={alertProps} dataTestId={dataTestId}>
      {children}
    </Message>
  );
}
