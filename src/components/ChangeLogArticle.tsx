import { Flex, Stack, rem, Text, Badge, ScrollArea } from '@mantine/core';
import React from 'react';

export function ChangeLogArticle({ title, date, tags, author, content }: { title: string; date: string; tags: string[]; author: string; content: string }) {
  return (
    <Flex gap={rem(150)} mr={rem(150)}>
      <Stack w={rem(120)}>
        <Text size="h2">{title}</Text>
        <Stack spacing={rem(0)}>
          <Text color="dimmed" size="sm">
            {date}
          </Text>
          <Text color="dimmed" size="sm">{`by ${author}`}</Text>
        </Stack>
      </Stack>
      <ScrollArea sx={{ height: '100%', width: '100%' }}>
        <Stack>
          <Flex gap="sm">
            {tags.map((tag) => (
              <Badge key="{tag}key">{tag}</Badge>
            ))}
          </Flex>
          <Text>{content}</Text>
        </Stack>
      </ScrollArea>
    </Flex>
  );
}
