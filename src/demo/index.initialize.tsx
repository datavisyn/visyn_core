import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { VisynAppProvider } from '../app/VisynAppProvider';
import { MainApp } from './MainApp';

// create a new instance of the app
createRoot(document.getElementById('main')).render(
  <React.StrictMode>
    <VisynAppProvider appName="Demo App" disableMantine6>
      <MainApp />
    </VisynAppProvider>
  </React.StrictMode>,
);
