import { Tooltip } from '@mantine/core';
import * as React from 'react';
import { useMemo, useState } from 'react';

export function ParallelPath({
  path,
  hovered,
  id,
  onHover = () => null,
  onLeave = () => null,
  isSelected,
}: {
  path: string;
  hovered: string | null;
  id: string;
  onLeave?: () => void;
  onHover?: () => void;
  isSelected?: boolean | null;
}) {
  const pathEle = useMemo(() => {
    return (
      <g>
        <path
          onMouseEnter={() => {
            onHover();
          }}
          onMouseOut={() => {
            onLeave();
          }}
          fill="none"
          stroke="cornflowerblue"
          opacity={isSelected === null ? 0.7 : isSelected ? 0.7 : 0.05}
          strokeWidth={2}
          d={path}
        />
      </g>
    );
  }, [isSelected, onHover, onLeave, path]);

  return hovered && hovered === id ? (
    <Tooltip.Floating withinPortal label="hello world">
      {pathEle}
    </Tooltip.Floating>
  ) : (
    pathEle
  );
}
