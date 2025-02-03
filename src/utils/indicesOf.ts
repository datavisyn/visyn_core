export function indicesOf<T>(array: T[], predicate: (value: T, index: number) => boolean): number[] {
  const indices = new Array<number>(array.length);
  let count = 0;

  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i]!, i)) {
      indices[count++] = i;
    }
  }

  indices.length = count;

  return indices;
}
