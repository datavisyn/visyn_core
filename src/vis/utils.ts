import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR } from './general/constants';

/**
 *
 * @param label the label to check for undefined, null or empty
 * @param unknownLabel default: NAN_REPLACEMENT; the label to return if the input label is undefined, null or empty
 * @returns the label if it is not undefined, null or empty, otherwise NAN_REPLACEMENT (Unknown)
 */
export function getLabelOrUnknown(label: string | number | null | undefined, unknownLabel: string = NAN_REPLACEMENT): string {
  return label === null || label === 'null' || label === undefined || label === 'undefined' || label === '' ? unknownLabel : label.toString();
}

/**
 *
 * @param values the actual values of the data
 * @param colors the colors to assign to the values
 * @param color default: VIS_NEUTRAL_COLOR; the color to assign to null / undefined / empty values
 * @returns an array of colors with the same length as values, with the color assigned to null values
 */
export const assignColorToNullValues = (values: string[], colors: string[], color: string = VIS_NEUTRAL_COLOR) => {
  const newColors = [...colors];
  values.forEach((v, i) => {
    if (v === undefined || v === 'undefined' || v === null || v === 'null' || v === '') {
      newColors[i] = color;
    }
  });
  return newColors;
};
