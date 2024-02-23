import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { ModalsProvider, ModalsProviderProps } from '@mantine/modals';
import { Notifications, NotificationsProps } from '@mantine/notifications';
import { MantineProvider as Mantine6Provider, MantineProviderProps as Mantine6ProviderProps } from '@mantine6/core';
import { ModalsProvider as Mantine6ModalsProvider, ModalsProviderProps as Mantine6ModalsProviderProps } from '@mantine6/modals';
import { Notifications as Mantine6Notifications, NotificationsProps as Mantine6NotificationsProps } from '@mantine6/notifications';
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

// const LazyMantine6Provider = React.lazy(() => import('@mantine6/core').then((module) => ({ default: module.MantineProvider })));
// const LazyMantineProvider = React.lazy(() => import('@mantine/core').then((module) => ({ default: module.MantineProvider })));

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
  mantineProviderProps?: Omit<MantineProviderProps, 'children'> | Omit<Mantine6ProviderProps, 'children'>;
  mantineModalsProviderProps?: Omit<ModalsProviderProps, 'children'> | Omit<Mantine6ModalsProviderProps, 'children'>;
  mantineNotificationsProviderProps?: Omit<NotificationsProps, 'children'> | Omit<Mantine6NotificationsProps, 'children'>;
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

  const mergedMantineProviderProps = React.useMemo(
    () => merge(merge({}, disableMantine6 ? DEFAULT_MANTINE_PROVIDER_PROPS : DEFAULT_MANTINE6_PROVIDER_PROPS), mantineProviderProps || {}),
    [disableMantine6, mantineProviderProps],
  );

  return (
    <React.Suspense fallback={null}>
      {disableMantine6 ? (
        <MantineProvider {...(mergedMantineProviderProps as MantineProviderProps)}>
          <Notifications {...((mantineNotificationsProviderProps as NotificationsProps) || {})} />
          <ModalsProvider {...((mantineModalsProviderProps as ModalsProviderProps) || {})}>
            <VisProvider>
              <VisynAppContext.Provider value={context}>{initStatus === 'success' && successfulClientConfigInit ? children : null}</VisynAppContext.Provider>
            </VisProvider>
          </ModalsProvider>
        </MantineProvider>
      ) : (
        <Mantine6Provider {...(mergedMantineProviderProps as Mantine6ProviderProps)}>
          <Mantine6Notifications {...((mantineNotificationsProviderProps as Mantine6NotificationsProps) || {})} />
          <Mantine6ModalsProvider {...((mantineModalsProviderProps as Mantine6ModalsProviderProps) || {})}>
            <VisProvider>
              <VisynAppContext.Provider value={context}>{initStatus === 'success' && successfulClientConfigInit ? children : null}</VisynAppContext.Provider>
            </VisProvider>
          </Mantine6ModalsProvider>
        </Mantine6Provider>
      )}
    </React.Suspense>
  );
}
