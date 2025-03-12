import React from 'react';

import { Container, ScrollArea, SimpleGrid } from '@mantine/core';
import { ESupportedPlotlyVis } from './interfaces';
import { VisTypeChooserCard } from './VisTypeChooserCard';

const avalableVisTypes = Object.values(ESupportedPlotlyVis);

export function VisTypeChooser() {
  return (
    <Container fluid p={'sm'} h={'95vh'} w={'100%'} pos={'relative'}>
      <ScrollArea h={'100%'} w={'100%'}>
        <SimpleGrid cols={{ xs: 2, sm: 2, lg: 3, xl: 4 }} spacing="xl" verticalSpacing="xl">
          {avalableVisTypes.map((plotType, index) => (
            <VisTypeChooserCard key={index} onClick={() => {}} plotType={plotType}></VisTypeChooserCard>
          ))}
        </SimpleGrid>
      </ScrollArea>
    </Container>
  );
}
