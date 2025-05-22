import * as React from 'react';

import { css } from '@emotion/css';
import { CheckIcon } from '@mantine/core';

export const style = css`
  opacity: 1;
  width: 1em;
  min-width: 1em;
  height: 1em;
`;

export function VisynCheckIcon() {
  return <CheckIcon className={style} />;
}
