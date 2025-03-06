import * as React from 'react';

import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';

import { VisynAppProvider } from '../app/VisynAppProvider';

const MainApp = React.lazy(() => import('./MainApp').then((module) => ({ default: module.MainApp })));

export const SENTRY_INIT_OPTIONS: Parameters<typeof VisynAppProvider>[0]['sentryInitOptions'] = {
  integrations: (integrations) => [
    ...integrations,
    // Capture all console.error calls
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
    // Instrument browser pageload/navigation performance
    Sentry.browserTracingIntegration(),
  ],
};

// create a new instance of the app
createRoot(document.getElementById('main')!).render(
  <React.StrictMode>
    <VisynAppProvider appName="Demo App" waitForSentry sentryInitOptions={SENTRY_INIT_OPTIONS}>
      <React.Suspense fallback={null}>
        <MainApp />
      </React.Suspense>
    </VisynAppProvider>
  </React.StrictMode>,
);
