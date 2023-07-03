import * as React from 'react';
// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxisTickLabel({ value }: { value: string }) {
  const ref = React.useRef<SVGTextElement>(null);
  const offset = 5;
  const width = (ref.current?.getBBox().width || 10) + offset;
  return (
    <>
      <rect x={-width - offset} y="-7.5" width={width} height="15" opacity={0.5} fill="white" rx={5} />
      <text
        ref={ref}
        key={value}
        style={{
          dominantBaseline: 'middle',
          fontSize: '10px',
          textAnchor: 'end',
          transform: 'translateX(-8px)',
        }}
      >
        {value}
      </text>
    </>
  );
}
