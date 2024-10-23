import React from 'react';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@mantine/core';

export function WarningMessage({
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
    <Alert title={title} variant="light" color="yellow" icon={<FontAwesomeIcon icon={faExclamationCircle} />} {...alertProps} data-test-id={dataTestId}>
      {children}
    </Alert>
  );
}
