import { css } from '@emotion/css';

export const optionsDropdownOptions = css`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  &:where([data-reverse]) {
    justify-content: space-between;
  }

  &:where([data-combobox-selected]) {
    outline: 1px solid var(--mantine-primary-color-filled);
    background-color: inherit;
    color: black;
  }

  &:where([data-checked]) {
    background-color: var(--mantine-color-gray-1);
  }

  // Hover
  &:hover {
    background-color: var(--mantine-color-gray-0);
  }
`;
