import * as React from 'react';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { ModalsProvider, ModalsProviderProps } from '@mantine/modals';
import { Notifications, NotificationsProps } from '@mantine/notifications';
import type { BrowserOptions } from '@sentry/react';
import merge from 'lodash/merge';

import { loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp } from '../hooks';
import { VisynAppContext } from './VisynAppContext';
import { dispatchVisynEvent } from './VisynEvents';
import { DEFAULT_MANTINE_PROVIDER_PROPS } from './constants';
import { VisynEnv } from '../base/VisynEnv';
import { useVisynEventCallback } from '../hooks/useVisynEventCallback';
import { userSession } from '../security/UserSession';
import type { IUser } from '../security/interfaces';
import { VisProvider } from '../vis/Provider';

import '@mantine/code-highlight/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

/**
 * The main provider for the visyn app context.
 */
export function VisynAppContextProvider({
  children,
  appName,
  sentryInitOptions = {},
  sentryOptions = {},
  waitForClientConfig = true,
  waitForSentry = true,
}: {
  children?: React.ReactNode;
  appName: JSX.Element | string;
  /**
   * Options to pass to Sentry.init. The DSN is automatically set from the client config.
   */
  sentryInitOptions?: Omit<BrowserOptions, 'dsn'> | (() => Promise<Omit<BrowserOptions, 'dsn'>>);
  /**
   * Additional options for the Sentry integration.
   * @deprecated Is not used anymore.
   */
  sentryOptions?: {
    /**
     * Set the user in Sentry. Defaults to true.
     * @deprecated Uses the `sendDefaultPii` from now on.
     */
    setUser?: boolean;
  };
  /**
   * Set this to false to skip the wait for the client config. This is useful if the app works even without the client config.
   * @default `true`
   */
  waitForClientConfig?: boolean;
  /**
   * Set this to true to wait for the Sentry initialization before rendering the children.
   * @default `true`
   */
  waitForSentry?: boolean;
}) {
  const [user, setUser] = React.useState<IUser | null>(userSession.currentUser());
  useVisynEventCallback('userLoggedIn', ({ detail }) => setUser(detail.user));
  useVisynEventCallback('userLoggedOut', () => setUser(null));

  const { status: initStatus } = useInitVisynApp();

  // Add the user as argument such that whenever the user changes, we want to reload the client config to get the latest permissions.
  const loadClientConfigCallback = React.useCallback((_: IUser | null) => loadClientConfig(), []);
  const { value: clientConfig, status: clientConfigStatus } = useAsync(loadClientConfigCallback, [user]);
  // Once the client config is loaded, we can set the successful client config init.
  // This is required as when the user changes, we reload the client config but don't want to trigger a complete unmount.
  const [successfulClientConfigInit, setSuccessfulClientConfigInit] = React.useState<boolean>(false);
  if (clientConfigStatus === 'success' && !successfulClientConfigInit) {
    setSuccessfulClientConfigInit(true);
  }

  const [successfulSentryInit, setSuccessfulSentryInit] = React.useState<boolean | 'skipped'>(false);
  React.useEffect(() => {
    // Hook to initialize Sentry if a DSN is provided.
    if (clientConfig?.sentry_dsn) {
      import('@sentry/react').then(async (Sentry) => {
        if (!Sentry.isInitialized()) {
          const resolvedSentryInitOptions = typeof sentryInitOptions === 'function' ? await sentryInitOptions() : sentryInitOptions;
          const client = Sentry.init({
            release: `${VisynEnv.__APP_NAME__}@${VisynEnv.__VERSION__}`,
            /*
            Do not instantiate integrations here, as the apps should do this instead.
            integrations: [
              // Capture all console.error calls
              Sentry.captureConsoleIntegration({ levels: ['error'] }),
              // Instrument browser pageload/navigation performance
              Sentry.browserTracingIntegration(),
            ],
            */
            // We want to avoid having [object Object] in the Sentry breadcrumbs, so we increase the depth.
            normalizeDepth: 5,
            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            tracesSampleRate: 1.0,
            // Set send_default_pii to True to send PII like the user's IP address.
            sendDefaultPii: true,
            // Add our own options
            ...(resolvedSentryInitOptions || {}),
            // And finally set the DSN and tunnel
            dsn: clientConfig.sentry_dsn,
            tunnel: clientConfig.sentry_proxy_to,
          });
          dispatchVisynEvent('sentryInitialized', { client });
        }
        setSuccessfulSentryInit(true);
      });
    } else if (successfulClientConfigInit) {
      // If the client config is loaded but no DSN is provided, we can set the successful Sentry init.
      setSuccessfulSentryInit('skipped');
    }
  }, [clientConfig, successfulClientConfigInit, sentryInitOptions]);

  React.useEffect(() => {
    // Hook to set the user in Sentry if it is initialized and the user is set.
    if (successfulSentryInit === true && user) {
      import('@sentry/react').then((Sentry) => {
        if (Sentry.isInitialized() && Sentry.getClient()?.getOptions()?.sendDefaultPii) {
          Sentry.setUser({
            id: user.name,
            username: user.name,
          });
        }
      });
    }
  }, [successfulSentryInit, user]);

  const context = React.useMemo<Parameters<typeof VisynAppContext.Provider>[0]['value']>(
    () => ({
      user,
      appName,
      clientConfig,
      successfulClientConfigInit,
      successfulSentryInit,
      initStatus,
    }),
    [user, appName, clientConfig, successfulClientConfigInit, successfulSentryInit, initStatus],
  );

  return (
    <VisynAppContext.Provider value={context}>
      {initStatus === 'success' && (!waitForClientConfig || successfulClientConfigInit) && (!waitForSentry || successfulSentryInit) ? (
        <VisProvider>{children}</VisProvider>
      ) : null}
    </VisynAppContext.Provider>
  );
}

/**
 * The main provider for Mantine in the visyn app.
 */
export function VisynAppMantineProvider({
  children,
  mantineProviderProps,
  mantineModalsProviderProps,
  mantineNotificationsProviderProps,
}: {
  children?: React.ReactNode;
  /**
   * Props to merge with the `DEFAULT_MANTINE_PROVIDER_PROPS`.
   */
  mantineProviderProps?: Omit<MantineProviderProps, 'children'>;
  mantineModalsProviderProps?: Omit<ModalsProviderProps, 'children'>;
  mantineNotificationsProviderProps?: Omit<NotificationsProps, 'children'>;
}) {
  const mergedMantineProviderProps = React.useMemo(() => merge(merge({}, DEFAULT_MANTINE_PROVIDER_PROPS), mantineProviderProps || {}), [mantineProviderProps]);

  return (
    <MantineProvider {...mergedMantineProviderProps}>
      <Notifications {...(mantineNotificationsProviderProps || {})} />
      <ModalsProvider {...(mantineModalsProviderProps || {})}>{children}</ModalsProvider>
    </MantineProvider>
  );
}

/**
 * The main provider for the visyn app. This provider is responsible for loading the client config, initializing Sentry and providing the user context.
 * It mounts both the `VisynAppContextProvider` and the `VisynAppMantineProvider`.
 */
export function VisynAppProvider(props: Parameters<typeof VisynAppContextProvider>[0] & Parameters<typeof VisynAppMantineProvider>[0]) {
  return (
    <VisynAppContextProvider {...props}>
      <VisynAppMantineProvider {...props}>{props.children}</VisynAppMantineProvider>
    </VisynAppContextProvider>
  );
}
