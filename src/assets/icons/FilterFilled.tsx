import React from 'react';

export function FilterFilled({ width, height, color = '#C8CED3' }: { width: number; height: number; color?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 118 103" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.27734 0H113.781C117.117 0 118.987 3.84273 116.929 6.4679L72.7915 62.7686C72.2394 63.4727 71.9394 64.3417 71.9394 65.2365V83.1325C71.9394 84.3961 71.3424 85.5853 70.3291 86.3402L50.3291 101.24C47.6905 103.205 43.9394 101.322 43.9394 98.0321V61.8434C43.9394 60.9409 43.6342 60.065 43.0735 59.3579L1.14326 6.48547C-0.935898 3.86372 0.931229 0 4.27734 0Z"
        fill={color}
      />
    </svg>
  );
}
