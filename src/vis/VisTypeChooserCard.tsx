import React from 'react';

import { css, cx } from '@emotion/css';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons/faHeart';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ActionIcon,
  Box,
  Card,
  Divider,
  SimpleGrid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
  useMantineTheme,
  Container,
  ScrollArea,
} from '@mantine/core';
import { useElementSize, useHover } from '@mantine/hooks';
import { ESupportedPlotlyVis } from './interfaces';

const avalableVisTypes = Object.values(ESupportedPlotlyVis);

function VisTypeChooserCardUnmemoized({ plotType, onClick }: { plotType: string; onClick?: (app: any) => void }) {
  const { hovered: internalHovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const colorScheme = useMantineColorScheme();
  const theme = useMantineTheme();
  const active = false;
  const { ref: collapsedStackRef, height: heightOfCollapsedStack } = useElementSize();
  const hovered = internalHovered;

  const isFavorite = true;

  return (
    <Card
      key={plotType}
      withBorder
      shadow="sm"
      radius="md"
      w="100%"
      minW="300px"
      ref={hoverRef}
      onClick={() => null}
      style={{ minHeight: '300px', maxHeight: '350px', height: 'fit-content', flex: '1 1 auto' }}
      styles={{
        root: {
          cursor: 'pointer',
          borderColor: active ? theme.colors[theme.primaryColor]![5] : undefined,
          viewTransitionName: `todo`,
        },
      }}
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
                {/* TODO: add an icons */}
              </ThemeIcon>
              <Text
                fw={700}
                size="md"
                truncate
                className={css`
                  transition: color 0.3s;
                `}
              >
                {plotType}
              </Text>
            </Group>
            {isFavorite ? (
              <Stack display="flex" justify="flex-end" align="end" w="100%" p="lg" style={{ zIndex: 1, position: 'absolute', top: 0, right: 0, left: 0 }}>
                <ActionIcon
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    //   setFavorite((aList) => (aList.includes(app) ? aList.filter((appId) => appId !== app) : [app].concat(aList)));
                  }}
                  variant="filled"
                  bg="rgba(255, 255, 255, 0.6)"
                >
                  <FontAwesomeIcon size="lg" icon={isFavorite ? faHeart : faHeartRegular} color={theme.colors.dvPrimary![6]} />
                </ActionIcon>
              </Stack>
            ) : null}
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
                  <Text fw={700} size="sm">
                    Title
                  </Text>
                  <Text inherit lineClamp={10} span>
                    Desctiption
                  </Text>
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Card.Section>
      </Stack>
    </Card>
  );
}
export const VisTypeChooserCard = React.memo(VisTypeChooserCardUnmemoized);
