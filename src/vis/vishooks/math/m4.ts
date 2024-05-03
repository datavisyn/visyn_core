/* eslint-disable no-param-reassign */
import { Matrix4x4, Vector3 } from './interfaces';

/**
 * A matrix in javascript notation is a 4x4 array of numbers.
 * This means that the matrix is represented as follows:
 *
 * | 0  1  2  3 |
 * | 4  5  6  7 |
 * | 8  9 10 11 |
 * | 12 13 14 15|
 *
 * which is row-major order. (unlike column-major order in mathematical notation).
 *
 * Since the individual components in mathematical notation look like this:
 *
 * | sx  0  0 tx |
 * |  0 sy  0 ty |
 * |  0  0 sz tz |
 * |  0  0  0  1 |
 *
 * we need to transpose the indices to get the correct values.
 *
 * | sx  0  0  0 |
 * |  0 sy  0  0 |
 * |  0  0 sz  0 |
 * | tx ty tz  1 |
 *
 */

// Translation components
export const txi = 12;
export const tyi = 13;
export const tzi = 14;

// Scale components
export const sxi = 0;
export const syi = 5;
export const szi = 10;

/**
 * Returns a new identity matrix. If out is specified, the result is copied into out.
 */
export function I(out: Matrix4x4 = new Float32Array(16)): Matrix4x4 {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;

  return out;
}

export function setTranslation(a: Matrix4x4, x: number, y: number, z: number): Matrix4x4 {
  a[txi] = x;
  a[tyi] = y;
  a[tzi] = z;

  return a;
}

export function setScaling(a: Matrix4x4, x: number, y: number, z: number): Matrix4x4 {
  a[sxi] = x;
  a[syi] = y;
  a[szi] = z;

  return a;
}

export function getTranslation(out: Vector3, a: Matrix4x4) {
  out[0] = a[txi];
  out[1] = a[tyi];
  out[2] = a[tzi];

  return out;
}

export function getScaling(out: Vector3, a: Matrix4x4): Vector3 {
  out[0] = a[sxi];
  out[1] = a[syi];
  out[2] = a[szi];

  return out;
}

export function clone(a: Matrix4x4): Matrix4x4 {
  return new Float32Array(a);
}
