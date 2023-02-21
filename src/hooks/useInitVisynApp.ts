import React from 'react';
import { useAsync } from './useAsync';
import { i18nManager } from '../i18n';

export function useInitVisynApp() {
  const initI18n = React.useMemo(
    () => () => {
      return i18nManager.initI18n();
    },
    [],
  );
  return useAsync(initI18n, []);
}
