import { css } from '@emotion/css';

export const optionsDropdownCheckIcon = css`
  opacity: 0.4;
  width: 0.8em;
  min-width: 0.8em;
  height: 0.8em;

  :where([data-combobox-selected]) & {
    opacity: 1;
  }
`;

export const optionsDropdownOptions = css`
  display: flex;
  align-items: center;
  gap: 8px;

  &:where([data-reverse]) {
    justify-content: space-between;
  }
`;
