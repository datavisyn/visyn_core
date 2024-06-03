export function getLabelOrUnknown(label: string | number | null | undefined): string {
  return label === null || label === undefined || label === '' ? 'Unknown' : label.toString();
}
