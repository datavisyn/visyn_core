import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { ModalsProvider, ModalsProviderProps } from '@mantine/modals';
import { Notifications, NotificationsProps } from '@mantine/notifications';
import merge from 'lodash/merge';
import * as React from 'react';
import { loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp, useVisynUser } from '../hooks';
import { VisProvider } from '../vis/Provider';
import { VisynAppContext } from './VisynAppContext';
import { DEFAULT_MANTINE6_PROVIDER_PROPS, DEFAULT_MANTINE_PROVIDER_PROPS } from './constants';

import '@mantine/code-highlight/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

const LazyMantine6Provider = React.lazy(() => import('@mantine6/core').then((module) => ({ default: module.MantineProvider })));

export function VisynAppProvider({
  disableMantine6 = false,
  children,
  appName,
  mantineProviderProps,
  mantineModalsProviderProps,
  mantineNotificationsProviderProps,
}: {
  /**
   * Set this to true to disable the MantineProvider of Mantine 6. Use only if no Mantine 6 components are used.
   */
  disableMantine6?: boolean;
  children?: React.ReactNode;
  appName: JSX.Element | string;
  /**
   * Props to merge with the `DEFAULT_MANTINE_PROVIDER_PROPS`.
   */
  mantineProviderProps?: Omit<MantineProviderProps, 'children'>;
  mantineModalsProviderProps?: Omit<ModalsProviderProps, 'children'>;
  mantineNotificationsProviderProps?: Omit<NotificationsProps, 'children'>;
}) {
  const user = useVisynUser();
  const { status: initStatus } = useInitVisynApp();

  const { value: clientConfig, status: clientConfigStatus, execute } = useAsync(loadClientConfig);
  const [successfulClientConfigInit, setSuccessfulClientConfigInit] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Once the client config is loaded, we can set the successful client config init.
    // This is required as when the user changes, we reload the client config but don't want to trigger a complete unmount.
    if (clientConfigStatus === 'success') {
      setSuccessfulClientConfigInit(true);
    }
  }, [clientConfigStatus]);

  React.useEffect(() => {
    // Whenever the user changes, we want to reload the client config to get the latest permissions.
    execute();
  }, [user, execute]);

  const context = React.useMemo(
    () => ({
      user,
      appName,
      clientConfig,
    }),
    [user, appName, clientConfig],
  );

  const mergedMantineProviderProps = React.useMemo(() => merge(merge({}, DEFAULT_MANTINE_PROVIDER_PROPS), mantineProviderProps || {}), [mantineProviderProps]);
  const mergedMantine6ProviderProps = React.useMemo(
    () => merge(merge({}, DEFAULT_MANTINE6_PROVIDER_PROPS), mantineProviderProps || {}),
    [mantineProviderProps],
  );

  // Extract as variable to more easily make LazyMantine6Provider optional
  const visynAppContext = (
    <VisynAppContext.Provider value={context}>{initStatus === 'success' && successfulClientConfigInit ? children : null}</VisynAppContext.Provider>
  );

  return (
    <VisProvider>
      <MantineProvider {...mergedMantineProviderProps}>
        <Notifications {...(mantineNotificationsProviderProps || {})} />
        <ModalsProvider {...(mantineModalsProviderProps || {})}>
          {disableMantine6 ? (
            visynAppContext
          ) : (
            <React.Suspense fallback={null}>
              <LazyMantine6Provider {...mergedMantine6ProviderProps}>{visynAppContext}</LazyMantine6Provider>
            </React.Suspense>
          )}
        </ModalsProvider>
      </MantineProvider>
    </VisProvider>
  );
}
