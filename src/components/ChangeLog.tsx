import { Button, Text, Title, Stack, Timeline, Affix, Group, Badge, ScrollArea, Flex, rem, Menu, Tabs, Checkbox, Transition } from '@mantine/core';
import * as React from 'react';
import { useWindowScroll } from '@mantine/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeLogArticle } from './ChangeLogArticle';
import { ChangeLogFilter } from './ChangeLogFilter';

// TODO:
// + Affix

export function ChangeLog({ title, date, tags, author, content }: { title: string; date: string; tags: string[]; author: string; content: string }) {
  const [scroll, scrollTo] = useWindowScroll();
  return (
    <Stack m="md">
      <Stack align="center">
        <Title size="h3">CHANGELOG</Title>
        <Text>Maybe sone general description about the project, this is optional</Text>
      </Stack>
      <Group position="right" mr="md">
        <Button>filter by</Button>
      </Group>
      <ScrollArea>
        <Timeline active={6}>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
          <Timeline.Item>
            <ChangeLogArticle title={title} author={author} content={content} date={date} tags={tags} />
          </Timeline.Item>
        </Timeline>
      </ScrollArea>
      <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button leftIcon={<FontAwesomeIcon icon="arrow-up" />} style={transitionStyles} onClick={() => scrollTo({ y: 0 })}>
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </Stack>
  );
}
