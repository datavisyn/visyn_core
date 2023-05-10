import { Tooltip } from '@mantine/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export function SingleBar({ x, width, y, height, value }: { x: number; width: number; y: number; height: number; value: number }) {
  return (
    <Tooltip.Floating withinPortal label={value}>
      <rect x={x} width={width} y={y} height={height} fill="cornflowerblue" />
    </Tooltip.Floating>
  );
}
