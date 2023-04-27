import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { VisynAppProvider } from '../app/VisynAppProvider';
import { MainApp } from './MainApp';

// create a new instance of the app
const container = document.getElementById('main');
if (container) {
  createRoot(container).render(
    <VisynAppProvider appName="Demo App">
      <MantineProvider withNormalizeCSS withCSSVariables>
        <MainApp />
      </MantineProvider>
    </VisynAppProvider>,
  );
} else {
  console.error('Could not find container element. This might indicate a problem with the app.');
}
