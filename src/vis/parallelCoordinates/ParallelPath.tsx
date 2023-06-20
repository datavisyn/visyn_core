import * as React from 'react';

export function ParallelPath({
  path,
  index,
  onHover,
  onLeave,
}: {
  path: string;
  index: number;
  onLeave: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onHover: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
}) {
  return <path onMouseEnter={onHover} onMouseLeave={onLeave} fill="none" stroke="#337ab7" strokeWidth={0.5} data-index={index} d={path} />;
}
