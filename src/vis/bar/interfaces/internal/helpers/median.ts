export function median(arr: number[]) {
  if (arr.length === 0) {
    return null;
  }
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr]
    .filter((n) => ![Infinity, -Infinity].includes(n))
    .filter(Boolean)
    .sort((a, b) => a - b) as number[];
  const medianVal = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1]! + nums[mid]!) / 2;
  return medianVal;
}
