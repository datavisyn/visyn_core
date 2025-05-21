import * as React from 'react';

import { css } from '@emotion/css';
import { CheckIcon } from '@mantine/core';

export const style = css`
  opacity: 1;
  width: 0.8em;
  min-width: 0.8em;
  height: 0.8em;
`;

export function VisynCheckIcon() {
  return <CheckIcon className={style} />;
}
