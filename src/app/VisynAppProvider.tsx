import * as React from 'react';
import { MantineProvider, MantineProviderProps } from '@mantine/core';
import merge from 'lodash/merge';
import { Notifications, NotificationsProps } from '@mantine/notifications';
import { ModalsProvider, ModalsProviderProps } from '@mantine/modals';
import { loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp, useVisynUser } from '../hooks';
import { VisynAppContext } from './VisynAppContext';
import { DEFAULT_MANTINE_PROVIDER_PROPS } from './constants';

export function VisynAppProvider({
  children,
  appName,
  mantineProviderProps,
  mantineModalsProviderProps,
  mantineNotificationsProviderProps,
}: {
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

  return (
    <MantineProvider {...mergedMantineProviderProps}>
      <Notifications {...mantineNotificationsProviderProps} />
      <ModalsProvider {...mantineModalsProviderProps}>
        <VisynAppContext.Provider value={context}>{initStatus === 'success' && successfulClientConfigInit ? children : null}</VisynAppContext.Provider>
      </ModalsProvider>
    </MantineProvider>
  );
}
