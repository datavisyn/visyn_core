import * as React from 'react';
import { loadClientConfig } from '../base/clientConfig';
import { useAsync, useInitVisynApp, useVisynUser } from '../hooks';
import { VisynAppContext } from './VisynAppContext';

export function VisynAppProvider({ children, appName }: { children?: React.ReactNode; appName: JSX.Element | string }) {
  const user = useVisynUser();
  const { status: initStatus } = useInitVisynApp();

  const { value: clientConfig, status: clientConfigStatus } = useAsync(loadClientConfig, []);

  const context = React.useMemo(
    () => ({
      user,
      appName,
      clientConfig,
    }),
    [user, appName, clientConfig],
  );

  return <VisynAppContext.Provider value={context}>{initStatus === 'success' && clientConfigStatus === 'success' ? children : null}</VisynAppContext.Provider>;
}
