import React, { useMemo } from 'react';

import { Container, SimpleGrid } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { GeneralVis } from './Provider';
import { VisTypeChooserCard } from './VisTypeChooserCard';

/**
 * Get the number of columns based on the width of the container.
 * @param width container width
 * @returns number of columns based on width
 */
function getCols(width: number): number {
  if (width < 500) {
    return 1;
  }
  if (width < 800) {
    return 2;
  }
  if (width < 1400) {
    return 3;
  }
  return 4;
}

export function VisTypeChooser({ visTypes, onClick }: { visTypes: GeneralVis[]; onClick?: (plotType: string) => void }) {
  const { ref, width } = useElementSize();

  const cols = useMemo(() => getCols(width), [width]);

  return (
    <Container fluid p="sm" h="95vh" pos="relative" w="100%" data-testid="vis-type-chooser">
      <SimpleGrid ref={ref} cols={cols} spacing="xl" verticalSpacing="xl">
        {visTypes.map((plotType) => (
          <VisTypeChooserCard key={plotType.type} onClick={onClick} plotType={plotType} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
