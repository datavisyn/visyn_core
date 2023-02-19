import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VisynAppProvider } from '../app/VisynAppProvider';
import { MainApp } from './MainApp';

// create a new instance of the app
ReactDOM.render(
  <VisynAppProvider appName="Demo App">
    <MantineProvider withNormalizeCSS withCSSVariables>
      <MainApp />
    </MantineProvider>
  </VisynAppProvider>,
  document.getElementById('main'),
);
