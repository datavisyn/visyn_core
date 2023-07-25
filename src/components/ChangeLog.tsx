import { Button } from '@mantine/core';
import * as React from 'react';

export function ChangeLog({ c, text }: { c: string; text: string }) {
  return <Button color={c}>{text}</Button>;
}
