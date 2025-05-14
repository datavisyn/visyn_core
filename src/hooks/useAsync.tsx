import * as React from 'react';

import { useComparison } from './useComparison';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Wraps an (async) function and provides value, status and error states.
 *
 * Compares the `immediate` array using [use-deep-compare-effect](https://github.com/kentcdodds/use-deep-compare-effect) such that it does not have to be memoized.
 *
 * **Usage:**
 * ```typescript
 * // Somewhere outside
 * async function fetchData(id: number): Promise<string> {
 *   return fetch(...);
 * }
 *
 * // In the component
 * ...
 * const {status, error, execute: wrappedFetchData} = useAsync(fetchData);
 * // Or with single, but immediate execution
 * const {status, error, execute: wrappedFetchData} = useAsync(fetchData, [123]);
 * ...
 * wrappedFetchData(123)
 * ```
 *
 * @param asyncFunction Async function to be wrapped.
 * @param params Null if function should not be triggered immediately, or the initial parameter array if immediate.
 */
export const useAsync = <F extends (...args: any[]) => any, E = Error, T = Awaited<ReturnType<F>>>(
  asyncFunction: F,
  params: Parameters<F> | null = null,
  options?: {
    // Comparison strategy for the immediate parameter
    comparison: 'deep' | 'shallow';

    // If specified, instead of using the parameter to trigger the async function the deps are used
    deps?: React.DependencyList;
  },
) => {
  // Store this comparison so the order of hooks stays the same
  const comparisonType = options?.comparison ?? 'deep';

  const [state, setState] = React.useState<{
    status: useAsyncStatus;
    value: T | null;
    error: E | null;
    args: Parameters<F> | null;
  }>({ status: 'idle', value: null, error: null, args: null });

  const latestPromiseRef = React.useRef<Promise<T> | null>();
  const mountedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (...args: Parameters<typeof asyncFunction>) => {
      // Do not unset the value, as we mostly want to retain the last value to avoid flickering, i.e. for "silent" updates.
      setState((oldState) => ({ ...oldState, status: 'pending', error: null }));

      const currentPromise = Promise.resolve(asyncFunction(...args))
        .then((response: T) => {
          if (mountedRef.current && currentPromise === latestPromiseRef.current) {
            setState((oldState) => ({ ...oldState, status: 'success', value: response, args }));
          }
          return response;
        })
        .catch((e: E) => {
          if (mountedRef.current && currentPromise === latestPromiseRef.current) {
            setState({
              status: 'error',
              value: null,
              error: e,
              args,
            });
          }
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw e;
        });
      latestPromiseRef.current = currentPromise;
      return currentPromise;
    },
    [asyncFunction],
  );
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  React.useEffect(() => {
    if (params) {
      try {
        execute(...params);
      } catch (e) {
        // ignore any immediate error
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, useComparison((options?.deps ?? params ?? []) as unknown[], comparisonType)]);

  return { execute, status: state.status, value: state.value, error: state.error, args: state.args };
};
