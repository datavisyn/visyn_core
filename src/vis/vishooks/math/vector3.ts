/* eslint-disable no-param-reassign */
import { Vector3 } from './interfaces';

export type { Vector3 };

export function vector3(out = new Float32Array(3)): Vector3 {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;

  return out;
}
