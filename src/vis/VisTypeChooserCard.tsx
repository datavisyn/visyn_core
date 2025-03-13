import React, { useCallback } from 'react';

import { css, cx } from '@emotion/css';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, Divider, Group, Image, Paper, Stack, Text, ThemeIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useElementSize, useHover } from '@mantine/hooks';

import { dvBoxplot, dvCorrelationplot, dvHeatmap, dvHexbinplot, dvSankey, dvScatterplot, dvViolin } from '../icons';
import { GeneralVis } from './Provider';
import { ESupportedPlotlyVis } from './interfaces';

const iconMap = {
  [ESupportedPlotlyVis.SCATTER]: dvScatterplot,
  [ESupportedPlotlyVis.VIOLIN]: dvViolin,
  [ESupportedPlotlyVis.BOXPLOT]: dvBoxplot,
  [ESupportedPlotlyVis.BAR]: <i className="fa-solid fa-chart-bar" />,
  [ESupportedPlotlyVis.HEXBIN]: dvHexbinplot,
  [ESupportedPlotlyVis.HEATMAP]: dvHeatmap,
  [ESupportedPlotlyVis.SANKEY]: dvSankey,
  [ESupportedPlotlyVis.CORRELATION]: dvCorrelationplot,
};

function VisTypeChooserCardUnmemoized({ plotType, onClick }: { plotType: GeneralVis; onClick?: (plotType: string) => void }) {
  const { hovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const colorScheme = useMantineColorScheme();
  const theme = useMantineTheme();
  const { ref: collapsedStackRef, height: heightOfCollapsedStack } = useElementSize();

  const cardIcon = iconMap[plotType.type as keyof typeof iconMap];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, plotTypeName: string) => {
      if (e.key === 'Enter' && onClick) {
        onClick(plotTypeName);
      }
    },
    [onClick],
  );

  return (
    // NOTE: @dv-liza-nekhviadovich don't remove the div with key and tabIndex, it is needed for the keyboard navigation
    <div key={plotType.type} tabIndex={0} onKeyDown={(e) => handleKeyDown(e, plotType.type)}>
      <Card
        withBorder
        shadow="sm"
        radius="md"
        w="100%"
        ref={hoverRef}
        onClick={onClick ? () => onClick(plotType.type) : undefined}
        style={{ minHeight: '300px', maxHeight: '350px', height: 'fit-content', flex: '1 1 auto' }}
        styles={{
          root: {
            cursor: 'pointer',
            viewTransitionName: `vis-type-chooser-card-${plotType.type}`,
          },
        }}
        data-testid={`vis-type-chooser-card-${plotType.type}`}
        role="button"
      >
        <Stack gap="xs">
          <Card.Section>
            <Group wrap="nowrap" justify="space-between" m="sm">
              <Group wrap="nowrap" style={{ overflowX: 'auto' }}>
                <ThemeIcon
                  radius="xl"
                  size="2.45rem"
                  color="dark"
                  className={css`
                    transition: background-color 0.3s;
                  `}
                >
                  {React.isValidElement(cardIcon) ? cardIcon : <FontAwesomeIcon icon={cardIcon as IconDefinition} />}
                </ThemeIcon>
                <Text
                  fw={700}
                  size="md"
                  truncate
                  className={css`
                    transition: color 0.3s;
                  `}
                >
                  {plotType.type}
                </Text>
              </Group>
            </Group>
          </Card.Section>

          <Card.Section>
            <Box
              pos="relative"
              maw="100%"
              style={{
                position: 'relative',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80"
                alt="Test image"
                pos="absolute"
                loading="lazy"
                w="100%"
                fit="contain"
                className={css`
                  opacity: 1;
                  &[data-invalid='true'] {
                    opacity: 0.7;
                  }
                  // If hovered
                  &[data-hovered='true'] {
                    opacity: 1;
                  }
                  // Animate the transition
                  transition: opacity 0.3s;
                `}
                data-hovered={hovered}
              />
            </Box>
          </Card.Section>

          <Card.Section>
            <Box
              pos="absolute"
              bottom={0}
              w="100%"
              style={{
                // Create a little box at the bottom to avoid seeing the image behind the mask below
                height: '4rem',
                backgroundColor: colorScheme.colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
              }}
            />

            <Stack
              className={cx(css`
                transition: all 0.33s ease;
                padding: 0;
                height: ${hovered ? `${heightOfCollapsedStack}px` : '4rem'};
                mask-size: ${hovered ? '200% 200%' : '100% 100%'}; // Hacky way to animate the mask away
                mask-image: linear-gradient(black calc(100% - 35px), transparent calc(100% - 5px));
              `)}
              pos="absolute"
              bottom={0}
              left={0}
              right={0}
              gap="xs"
            >
              <Paper
                radius={0}
                shadow="md"
                // pt="sm"
                flex={1}
              >
                <Stack gap="xs" style={{ height: '100%' }} ref={collapsedStackRef}>
                  <Divider orientation="horizontal" />
                  <Text p="sm" pt={0} flex={1} size="sm">
                    {/* <tabIndex={0}Text fw={700} size="sm">
                    Title
                  </Text> */}
                    <Text inherit lineClamp={10} span>
                      {plotType.description}
                    </Text>
                  </Text>
                </Stack>
              </Paper>
            </Stack>
          </Card.Section>
        </Stack>
      </Card>
    </div>
  );
}
export const VisTypeChooserCard = React.memo(VisTypeChooserCardUnmemoized);
