import { hsl } from 'd3v7';
import clamp from 'lodash/clamp';

/**
 * Generates a deselection color based on the fill color. It works by making the color semi-transparent.
 *
 * @param color The fill color of the mark.
 * @returns The deselection color.
 */
export function generateDeselectionColor(color: string) {
  const hslColor = hsl(color);
  hslColor.opacity = 0.3;
  return hslColor.toString();
}

/**
 * Generates a selection color based on the fill color. It works by making the color fully opaque.
 *
 * @param color The fill color of the mark.
 * @returns The selection color.
 */
export function generateSelectionColor(color: string) {
  const hslColor = hsl(color);
  hslColor.opacity = 1;
  return hslColor.toString();
}

/**
 * Generates a dark border color based on the fill color. This version should be used when having a light background.
 *
 * @param color The fill color of the mark.
 * @param lightnessDelta The amount to decrease the lightness of the color by.
 * @returns The dark border color.
 */
export function generateDarkBorderColor(color: string, lightnessDelta: number = 0.25) {
  const hslColor = hsl(color);
  hslColor.l = clamp(hslColor.l - lightnessDelta, 0, 1);
  return hslColor.toString();
}

/**
 * Generates a dark highlight color based on the fill color. This version should be used when having a light background.
 *
 * @param color The fill color of the mark.
 * @param lightnessDelta The amount to decrease the lightness of the color by.
 * @returns The dark highlight color.
 */
export function generateDarkHighlightColor(color: string, lightnessDelta: number = 0.15) {
  const hslColor = hsl(color);
  hslColor.l = clamp(hslColor.l - lightnessDelta, 0, 1);
  return hslColor.toString();
}

export function generateDynamicTextColor(color: string) {
  const hslColor = hsl(color);
  return hslColor.l > 0.5 ? 'black' : 'white';
}
