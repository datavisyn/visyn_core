import { Dispatch, SetStateAction, useCallback, useState } from 'react';

interface UseControlledUncontrolledProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: Dispatch<SetStateAction<T>>;
}

export function useControlledUncontrolled<T>({ value, defaultValue, onChange }: UseControlledUncontrolledProps<T>): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const handleChange: Dispatch<SetStateAction<T>> = useCallback(
    (val: T) => {
      setInternalValue(val);
      onChange?.(val);
    },
    [onChange],
  );

  // Controlled mode
  if (value !== undefined) {
    return [value as T, onChange, true];
  }

  // Uncontrolled mode
  return [internalValue as T, handleChange, false];
}
