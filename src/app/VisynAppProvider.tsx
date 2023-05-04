import * as React from 'react';
import { MantineProvider, MantineProviderProps } from '@mantine/core';
import merge from 'lodash/merge';
import { loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp, useVisynUser } from '../hooks';
import { VisynAppContext } from './VisynAppContext';
import { DEFAULT_MANTINE_PROVIDER_PROPS } from './constants';

export function VisynAppProvider({
  children,
  appName,
  mantineProviderProps,
}: {
  children?: React.ReactNode;
  appName: JSX.Element | string;
  /**
   * Props to merge with the `DEFAULT_MANTINE_PROVIDER_PROPS`.
   */
  mantineProviderProps?: Omit<MantineProviderProps, 'children'>;
}) {
  const user = useVisynUser();
  const { status: initStatus } = useInitVisynApp();

  const { value: clientConfig, status: clientConfigStatus, execute } = useAsync(loadClientConfig, []);

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
      <VisynAppContext.Provider value={context}>{initStatus === 'success' && clientConfigStatus === 'success' ? children : null}</VisynAppContext.Provider>
    </MantineProvider>
  );
}
