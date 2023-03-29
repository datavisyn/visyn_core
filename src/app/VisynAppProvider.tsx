import * as React from 'react';
import { MantineProvider, MantineProviderProps } from '@mantine/core';
import merge from 'lodash/merge';
import { ITDPClientConfig, loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp, useVisynUser } from '../hooks';
import { VisynAppContext } from './VisynAppContext';
import { DEFAULT_MANTINE_PROVIDER_PROPS } from './constants';

export function VisynAppProvider({
  children,
  appName,
  defaultClientConfig,
  mantineProviderProps,
}: {
  children?: React.ReactNode;
  appName: JSX.Element | string;
  /**
   * Client configuration which is automatically populated by the '/clientConfig.json' on initialize.
   * To enable the asynchronous loading of the client configuration, pass an object (optionally with default values).
   * Passing falsy values disables the client configuration load.
   */
  defaultClientConfig?: ITDPClientConfig | null | undefined;
  /**
   * Props to merge with the `DEFAULT_MANTINE_PROVIDER_PROPS`.
   */
  mantineProviderProps?: Omit<MantineProviderProps, 'children'>;
}) {
  const user = useVisynUser();
  const { status: initStatus } = useInitVisynApp();

  const parseClientConfig = React.useCallback(async (): Promise<ITDPClientConfig> => {
    if (!defaultClientConfig) {
      return {};
    }
    const remoteClientConfig = await loadClientConfig();
    return merge(defaultClientConfig || {}, remoteClientConfig || {});
  }, [defaultClientConfig]);

  const { value: clientConfig, status: clientConfigStatus } = useAsync(parseClientConfig, []);

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
