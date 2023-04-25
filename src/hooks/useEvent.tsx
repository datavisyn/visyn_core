import * as React from 'react';

/**
 * Creates a callback that always has the latest version of the given handler.
 * Can be used to avoid stale closures in event handlers.
 *
 * Example:
 * ```tsx
 * const onClick = useEvent((e: MouseEvent) => {
 *  console.log(e);
 * });
 *
 * return <button onClick={onClick} />;
 * ```
 * @param handler Event handler to be wrapped.
 * @returns Callback that always has the latest version of the given handler.
 */
export function useEvent<T extends (...args: unknown[]) => unknown, P extends Parameters<T>>(handler: T) {
  const handlerRef = React.useRef<T>(null);

  React.useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return React.useCallback<T>((...args: P) => handlerRef.current?.(...args), []);
}
