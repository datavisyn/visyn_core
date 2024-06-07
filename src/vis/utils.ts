import { VIS_NEUTRAL_COLOR } from './general/constants';

export function getLabelOrUnknown(label: string | number | null | undefined): string {
  return label === null || label === 'null' || label === undefined || label === 'undefined' || label === '' ? 'Unknown' : label.toString();
}

export const assignGrayColorToNullValues = (values: string[], colors: string[]) => {
  const newColors = [...colors];
  values.forEach((v, i) => {
    if (v === undefined || v === 'undefined' || v === null || v === 'null' || v === '') {
      newColors[i] = VIS_NEUTRAL_COLOR;
    }
  });
  return newColors;
};
