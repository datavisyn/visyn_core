/**
 * No @types/jstat exist yet, this is a temporary workaround.
 */
declare module 'jstat' {
  export function corrcoeff(a: number[], b: number[]): number;
  export function spearmancoeff(a: number[], b: number[]): number;
  export function tukeyhsd(a: number[][]): number;
  export function ftest(a: number, b: number, c: number): number;
}
