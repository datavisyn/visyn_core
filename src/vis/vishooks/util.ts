import { Extent, Position } from './interfaces';

/**
 * Clamp a value between a minimum and maximum.
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a value is outside of an extent.
 */
export function outsideExtent(value: Position, extent: Extent) {
  return value.x < extent.x1 || value.x > extent.x2 || value.y < extent.y1 || value.y > extent.y2;
}

/**
 * Get the relative position of the mouse within an element.
 */
export function relativeMousePosition(element: HTMLElement, position: Position) {
  const bounds = element.getBoundingClientRect();

  return {
    x: position.x - bounds.left,
    y: position.y - bounds.top,
  };
}
