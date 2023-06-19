import React from 'react';

export function Line({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" />;
}
