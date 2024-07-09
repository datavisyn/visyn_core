import * as React from 'react';
import { LassoValue, lassoToSvgPath } from '../hooks';

export function SVGLasso({
  value,
  strokeWidth,
  fill,
  stroke,
  strokeDashArray,
}: {
  value: LassoValue;
  strokeWidth?: React.SVGAttributes<SVGPathElement>['strokeWidth'];
  fill?: React.SVGAttributes<SVGPathElement>['fill'];
  stroke?: React.SVGAttributes<SVGPathElement>['stroke'];
  strokeDashArray?: React.SVGAttributes<SVGPathElement>['strokeDasharray'];
}) {
  return (
    <path d={lassoToSvgPath(value)} fill={fill ?? 'none'} stroke={stroke ?? 'black'} strokeDasharray={strokeDashArray ?? '4'} strokeWidth={strokeWidth ?? 1} />
  );
}
