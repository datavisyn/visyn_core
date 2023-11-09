import { MantineProvider } from '@mantine/core';
import { Preview } from '@storybook/react';
import * as React from 'react';
import '../src/scss/main.scss';
import { initializeLibrary } from '../src/utils';

import '@mantine/core/styles.css';

// TODO: This is async, how to wait for it?
initializeLibrary();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </MantineProvider>
    ),
  ],
};

export default preview;
