import React, { useCallback } from 'react';

import { css, cx } from '@emotion/css';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Box, Card, Divider, Group, Image, Paper, Stack, Text, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { useElementSize, useHover } from '@mantine/hooks';

import { dvBoxplot, dvCorrelationplot, dvHeatmap, dvHexbinplot, dvSankey, dvScatterplot, dvViolin } from '../icons';
import { GeneralVis } from './Provider';
import { VisTypeChooserImage } from './VisTypeChooserImage';
import { ESupportedPlotlyVis } from './interfaces';
import { i18n } from '../i18n';

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

function VisTypeChooserCardUnmemoized({ plotType, isSelected, onClick }: { plotType: GeneralVis; isSelected: boolean; onClick?: (plotType: string) => void }) {
  const { hovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const colorScheme = useMantineColorScheme();
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
            viewTransitionName: `vis-type-chooser-card-${(plotType.type ?? '').toLowerCase().replace(/\s/g, '-')}`,
          },
        }}
        data-testid={`vis-type-chooser-card-${(plotType.type ?? '').toLowerCase().replace(/\s/g, '-')}`}
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
                {isSelected ? (
                  <Badge size="md" variant="light" data-testid={`snapshot-${(plotType.type ?? '').toLowerCase().replace(/\s/g, '-')}-selected-badge`}>
                    {i18n.t('visyn:vis.selectedBadge')}
                  </Badge>
                ) : null}
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
                src={VisTypeChooserImage({ chartName: plotType.type })}
                alt={`${plotType.type ?? ''} image`}
                px="md"
                pos="absolute"
                loading="lazy"
                w="100%"
                h="150px"
                fit="contain"
                className={css`
                  filter: grayscale(1);
                  &[data-invalid='true'] {
                    opacity: 0.7;
                  }
                  // If hovered
                  &[data-selected='true'],
                  &[data-hovered='true'] {
                    filter: grayscale(0);
                  }
                  // Animate the transition
                  transition: filter 0.3s;
                `}
                data-hovered={hovered}
                data-selected={isSelected}
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
