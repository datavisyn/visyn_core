import * as React from 'react';
import { useSetState } from '@mantine/hooks';
import useDeepCompareEffect from 'use-deep-compare-effect';

export type UseAsyncStatus = 'idle' | 'pending' | 'success' | 'error';

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
 * @param immediate Null if function should not be triggered immediately, or the initial parameter array if immediate.
 */
export const useAsync = <F extends (...args: any[]) => any, E = Error, T = Awaited<ReturnType<F>>>(
  asyncFunction: F,
  immediate: Parameters<F> | null = null,
) => {
  const [state, setState] = useSetState({
    status: 'idle' as UseAsyncStatus,
    value: null as T | null,
    args: null as Parameters<F> | null,
    error: null as E | null,
  });

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
      setState({
        status: 'pending',
        error: null,
      });

      const currentPromise = Promise.resolve(asyncFunction(...args))
        .then((response: T) => {
          if (mountedRef.current && currentPromise === latestPromiseRef.current) {
            setState({
              value: response,
              args,
              status: 'success',
            });
          }
          return response;
        })
        .catch((e: E) => {
          if (mountedRef.current && currentPromise === latestPromiseRef.current) {
            setState({
              value: null,
              error: e,
              args,
              status: 'error',
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw e;
        });
      latestPromiseRef.current = currentPromise;
      return currentPromise;
    },
    [asyncFunction, setState],
  );
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  // eslint-disable-next-line react-compiler/react-compiler
  useDeepCompareEffect(() => {
    if (immediate) {
      try {
        execute(...immediate);
      } catch (e) {
        // ignore any immediate error
      }
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, [execute, immediate]);

  return { execute, status: state.status, value: state.value, error: state.error, args: state.args };
};
