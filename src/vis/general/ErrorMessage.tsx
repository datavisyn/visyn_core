import React from 'react';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@mantine/core';

export function ErrorMessage({
  title,
  children,
  alertProps,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  alertProps?: React.ComponentProps<typeof Alert>;
}) {
  return (
    <Alert title={title} variant="light" color="red" icon={<FontAwesomeIcon icon={faExclamationCircle} />} {...alertProps}>
      {children}
    </Alert>
  );
}
