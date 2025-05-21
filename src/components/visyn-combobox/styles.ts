import { css } from '@emotion/css';

export const optionsDropdownCheckIcon = css`
  opacity: 1;
  width: 0.8em;
  min-width: 0.8em;
  height: 0.8em;
`;

export const optionsDropdownOptions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &:where([data-reverse]) {
    justify-content: space-between;
  }

  &:where([data-combobox-selected]) {
    outline: 2px solid var(--mantine-primary-color-filled);
    background-color: inherit;
    color: black;
  }

  // Hover
  &:hover {
    background-color: var(--mantine-color-gray-0);
  }
`;
