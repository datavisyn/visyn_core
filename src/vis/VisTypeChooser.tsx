import React, { useMemo } from 'react';

import { Container, SimpleGrid } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { GeneralVis } from './Provider';
import { VisTypeChooserCard } from './VisTypeChooserCard';
import './VisTypeChooser.scss';

/**
 * Get the number of columns based on the width of the container.
 * @param width container width
 * @returns number of columns based on width
 */
function getCols(width: number): number | undefined {
  if (!width) {
    return undefined;
  }
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

export function VisTypeChooser({
  visTypes,
  selectedVisType,
  onClick,
}: {
  visTypes: GeneralVis[];
  selectedVisType: string | null;
  onClick?: (plotType: string) => void;
}) {
  const { ref, width } = useElementSize();

  const cols = useMemo(() => getCols(width), [width]);

  return (
    <Container fluid p="sm" ref={ref} pos="relative" w="100%" data-testid="vis-type-chooser" className="vis-chooser-scroll-container">
      {cols ? (
        <SimpleGrid cols={cols} spacing="xl" verticalSpacing="xl">
          {visTypes.map((plotType) => (
            <VisTypeChooserCard key={plotType.type} onClick={onClick} plotType={plotType} isSelected={!!selectedVisType && selectedVisType === plotType.type} />
          ))}
        </SimpleGrid>
      ) : null}
    </Container>
  );
}
