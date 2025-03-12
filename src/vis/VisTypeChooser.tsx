import React from 'react';

import { css, cx } from '@emotion/css';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Box, Card, Divider, SimpleGrid, Group, Image, Paper, Stack, Text, ThemeIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useElementSize, useHover } from '@mantine/hooks';
import { ESupportedPlotlyVis } from './interfaces';

const avalableVisTypes = Object.values(ESupportedPlotlyVis);

export function VisTypeChooser({ onClick }: { onClick?: (app: any) => void }) {
  const { hovered: internalHovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const colorScheme = useMantineColorScheme();
  const theme = useMantineTheme();
  const active = false;
  const { ref: collapsedStackRef, height: heightOfCollapsedStack } = useElementSize();
  const hovered = internalHovered;
  return (
    <SimpleGrid cols={{ xs: 2, sm: 2, lg: 3, xl: 4 }} h={1000} spacing="xl" verticalSpacing="xl">
      {avalableVisTypes.map((v) => (
        <Card
          key={v}
          withBorder
          shadow="sm"
          radius="md"
          w="100%"
          h="100%"
          ref={hoverRef}
          onClick={() => null}
          styles={{
            root: {
              cursor: 'pointer',
              borderColor: active ? theme.colors[theme.primaryColor]![5] : undefined,
              viewTransitionName: `todo`,
            },
          }}
          role="button"
        >
          {' '}
          {v}
        </Card>
      ))}
    </SimpleGrid>
  );
}
