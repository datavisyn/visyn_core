import * as React from 'react';

import { createRoot } from 'react-dom/client';

import { MainApp } from './MainApp';
import { VisynAppProvider } from '../app/VisynAppProvider';

// create a new instance of the app
createRoot(document.getElementById('main')!).render(
  <React.StrictMode>
    <VisynAppProvider appName="Demo App" disableMantine6 waitForClientConfig={false}>
      <MainApp />
    </VisynAppProvider>
  </React.StrictMode>,
);
