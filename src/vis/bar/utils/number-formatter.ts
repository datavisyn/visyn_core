export const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
  maximumSignificantDigits: 4,
  notation: 'compact',
  compactDisplay: 'short',
});
