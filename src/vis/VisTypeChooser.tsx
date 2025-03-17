import React, { useCallback, useMemo } from 'react';

import { Container, SimpleGrid } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { GeneralVis } from './Provider';
import { VisTypeChooserCard } from './VisTypeChooserCard';

export function VisTypeChooser({ visTypes, onClick }: { visTypes: GeneralVis[]; onClick?: (plotType: string) => void }) {
  const { ref, width } = useElementSize();

  const getCols = useCallback((w: number): number => {
    if (w < 500) {
      return 1;
    }
    if (w < 800) {
      return 2;
    }
    if (w < 1400) {
      return 3;
    }
    return 4;
  }, []);

  const cols = useMemo(() => getCols(width), [width, getCols]);

  return (
    <Container fluid p="sm" h="95vh" pos="relative" w="100%">
      <SimpleGrid ref={ref} cols={cols} spacing="xl" verticalSpacing="xl">
        {visTypes.map((plotType) => (
          <VisTypeChooserCard key={plotType.type} onClick={onClick} plotType={plotType} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
