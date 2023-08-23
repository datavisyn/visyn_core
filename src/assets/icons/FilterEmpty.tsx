import React from 'react';

export function FilterEmpty({ width, height, color = '#C8CED3' }: { width: number; height: number; color?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 124 108" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.27734 3H116.781C120.117 3 121.987 6.84273 119.929 9.4679L75.7915 65.7686C75.2394 66.4727 74.9394 67.3417 74.9394 68.2365V86.1325C74.9394 87.3961 74.3424 88.5853 73.3291 89.3402L53.3291 104.24C50.6905 106.205 46.9394 104.322 46.9394 101.032V64.8434C46.9394 63.9409 46.6342 63.065 46.0735 62.3579L4.14326 9.48547C2.0641 6.86372 3.93123 3 7.27734 3Z"
        stroke={color}
        strokeWidth="5"
      />
    </svg>
  );
}
