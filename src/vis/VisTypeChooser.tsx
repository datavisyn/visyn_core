import React, { useMemo } from 'react';

import { Container, ScrollArea, SimpleGrid } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { GeneralVis } from './Provider';
import { VisTypeChooserCard } from './VisTypeChooserCard';

export function VisTypeChooser({ visTypes, onClick }: { visTypes: GeneralVis[]; onClick?: (plotType: string) => void }) {
  const { ref, width } = useElementSize();

  function getCols(w: number): number {
    if (w < 400) {
      return 1;
    }
    if (w < 800) {
      return 2;
    }
    if (w < 1400) {
      return 3;
    }
    return 4;
  }

  const cols = useMemo(() => getCols(width), [width]);

  return (
    <Container fluid p="sm" h="95vh" pos="relative" w="100%">
      <ScrollArea h="calc(100% - 2 * var(--mantine-spacing-sm))" w="100%">
        <SimpleGrid ref={ref} cols={cols} spacing="xl" verticalSpacing="xl">
          {visTypes.map((plotType) => (
            <VisTypeChooserCard key={plotType.type} onClick={onClick} plotType={plotType} />
          ))}
        </SimpleGrid>
      </ScrollArea>
    </Container>
  );
}
