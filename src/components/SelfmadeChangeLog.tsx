import React from 'react';
import { Stack, createStyles, Group, Title, Text, Flex, Badge, Divider, Space, Affix, rem, Transition, Button } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useWindowScroll } from '@mantine/hooks';
import { ChangeLogFilter } from './ChangeLogFilter';

const usedStyles = createStyles((themes) => ({
  lineWrapper: {
    display: 'flex',
    background: themes.colors.blue,
    height: '100%',
    width: '3px',
    top: '4px',
    position: 'sticky',
  },
  circleWrapper: {
    display: 'inline',
    width: '20px',
    height: '20px',
    borderWidth: '2px',
    borderRadius: '50%',
    top: '4px',
    position: 'sticky',
    backgroundColor: themes.colors.blue,
  },
}));
export function SelfmadeChangeLog({ title, date, tags, author, content }: { title: string; date: string; tags: string[]; author: string; content: string }) {
  const { classes } = usedStyles();
  const [scroll, scrollTo] = useWindowScroll();
  return (
    <Stack m="md" h="auto">
      <Stack align="center">
        <Title size="h3">CHANGELOG</Title>
        <Text>Maybe sone general description about the project, this is optional</Text>
      </Stack>
      <Group position="right" mr="md">
        <ChangeLogFilter />
      </Group>
      <Flex align="flex-start" gap="md">
        <Flex gap={0} align="center" direction="column" sx={{ alignSelf: 'stretch' }}>
          <div className={classes.circleWrapper} />
          <div className={classes.lineWrapper} />
        </Flex>
        <Stack top="4px" pos="sticky">
          <Title size="h4">{title}</Title>
          <Stack spacing={0}>
            <Text color="dimmed" size="sm">
              {date}
            </Text>
            <Text color="dimmed" size="sm">{`by ${author}`}</Text>
          </Stack>
        </Stack>
        <Stack sx={{ width: '80%', height: '100%' }} ml="sm">
          <Flex gap="sm">
            {tags.map((tag) => (
              <Badge key="{tag}key">{tag}</Badge>
            ))}
          </Flex>
          <Text size="md">{content}</Text>
        </Stack>
      </Flex>
      <Space h="sm" />
      <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftIcon={<FontAwesomeIcon icon={faArrowUp} size="xs" style={{ color: 'white' }} />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </Stack>
  );
}
