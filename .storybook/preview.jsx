import * as React from 'react';
import '../src/scss/main.scss';
import { initializeLibrary } from '../src/utils';
import { VisynAppProvider } from '../src/app/VisynAppProvider';

// TODO: This is async, how to wait for it?
initializeLibrary();

/**
 * @type {import('@storybook/react').Parameters}
 */
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

/**
 * @type {import('@storybook/react').Preview}
 */
export default {
  decorators: [
    Story => <VisynAppProvider appName="">
      <Story />
    </VisynAppProvider>
  ],
}
