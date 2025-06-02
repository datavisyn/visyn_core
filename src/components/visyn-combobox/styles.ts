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
    outline: 2px solid var(--mantine-primary-color-filled);
    outline-offset: -2px;
    background-color: inherit;
    color: black;
  }

  // Collides with hover color!
  // &:where([data-checked]) {
  //   background-color: var(--mantine-color-gray-0);
  // }

  &:hover {
    background-color: var(--mantine-color-gray-0);
  }
`;
