import { ScaleLinear } from 'd3-scale';
import { ZoomExtent, ZoomTransform } from './interfaces';
import { clamp } from './util';
import { m4, v3 } from './math';

export function identityZoom(): ZoomTransform {
  return m4.I();
}

export function invertX(transform: ZoomTransform, x: number) {
  const translation = m4.getTranslation(v3.I(), transform);
  const scale = m4.getScaling(v3.I(), transform);
  return (x - translation[0]) / scale[0];
}

export function invertY(transform: ZoomTransform, y: number) {
  const translation = m4.getTranslation(v3.I(), transform);
  const scale = m4.getScaling(v3.I(), transform);
  return (y - translation[1]) / scale[1];
}

export function rescaleX(transform: ZoomTransform, x: ScaleLinear<number, number>) {
  const newDomain = x
    .range()
    .map((r) => invertX(transform, r))
    .map((r) => x.invert(r));
  return x.copy().domain(newDomain);
}

export function rescaleY(transform: ZoomTransform, y: ScaleLinear<number, number>) {
  const newDomain = y
    .range()
    .map((r) => invertY(transform, r))
    .map((r) => y.invert(r));
  return y.copy().domain(newDomain);
}

export function translate(transform: ZoomTransform, x: number, y: number) {
  const scale = m4.getScaling(v3.I(), transform);
  const newTransform = m4.clone(transform);
  newTransform[12] += x * scale[0];
  newTransform[13] += y * scale[1];
  return newTransform;
}

export function defaultConstraint(transform: ZoomTransform, width: number, height: number) {
  const x0 = invertX(transform, 0);
  const x1 = invertX(transform, width) - width;
  const y0 = invertY(transform, 0);
  const y1 = invertY(transform, height) - height;

  return translate(transform, x1 > x0 ? (x0 + x1) / 2 : Math.min(0, x0) || Math.max(0, x1), y1 > y0 ? (y0 + y1) / 2 : Math.min(0, y0) || Math.max(0, y1));
}

/**
 * Given a zoom transform, a mouse position and a wheel delta, calculate the new zoom transform.
 * Note that this does only apply the zoom extent if it is provided.
 * The translation extent is applied at a later stage.
 */
export function calculateTransform(zoom: ZoomTransform, x: number, y: number, wheel: number, direction: 'x' | 'y' | 'xy', zoomExtent?: ZoomExtent) {
  const translation = m4.getTranslation(v3.I(), zoom);
  const scale = m4.getScaling(v3.I(), zoom);

  const zoomFactor = Math.exp(wheel * 0.1);

  let newScaleX = zoomFactor * scale[0];
  let newScaleY = zoomFactor * scale[1];

  if (zoomExtent) {
    newScaleX = clamp(newScaleX, zoomExtent[0], zoomExtent[1]);
    newScaleY = clamp(newScaleY, zoomExtent[0], zoomExtent[1]);
  }

  // downscaled coordinates relative to anchor
  const zoomPointX = (x - translation[0]) / scale[0];
  const zoomPointY = (y - translation[1]) / scale[1];

  const offsetX = -(zoomPointX * (newScaleX - scale[0]));
  const offsetY = -(zoomPointY * (newScaleY - scale[1]));

  const newX = translation[0] + offsetX;
  const newY = translation[1] + offsetY;

  const mtx = m4.I();
  m4.setTranslation(mtx, direction !== 'y' ? newX : translation[0], direction !== 'x' ? newY : translation[1], 0);
  m4.setScaling(mtx, direction !== 'y' ? newScaleX : scale[0], direction !== 'x' ? newScaleY : scale[1], 0);
  return mtx;
}
