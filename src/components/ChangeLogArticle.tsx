import { Flex, Stack, Text, Badge, Grid, createStyles, Title } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import React from 'react';
import { IArticle } from '../base';

const usedStyles = createStyles((themes) => ({
  lineWrapper: {
    display: 'flex',
    background: themes.colors.blue,
    height: '100%',
    width: '3px',
    top: '4px',
    position: 'sticky',
    marginBottom: '-13px',
  },
  circleWrapper: {
    display: 'inline',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    top: '4px',
    position: 'sticky',
    backgroundColor: themes.colors.blue,
    marginTop: '13px',
  },
}));

export function ChangeLogArticle({ article, largerThanSm }: { article: IArticle; largerThanSm: boolean }) {
  const { classes } = usedStyles();
  return (
    <Grid py={0} mx="10%">
      <Grid.Col span="content" py={0}>
        <Flex gap={0} align="center" direction="column" h="100%">
          <div className={classes.circleWrapper} />
          <div className={classes.lineWrapper} />
        </Flex>
      </Grid.Col>
      {largerThanSm ? (
        <>
          <Grid.Col span={2}>
            <Stack top="4px" pos="sticky" align="flex-start">
              <Title size="h4">{article.title}</Title>
              <Stack spacing={0}>
                <Text color="dimmed" size="sm">
                  {`on ${article.date.toLocaleDateString()}`}
                </Text>
                <Text color="dimmed" size="sm">{`by ${article.author}`}</Text>
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto">
            <Stack spacing={0}>
              <Flex gap="sm">
                {article.tags.map((tag) => (
                  <Badge key={`${tag}key`}>{tag}</Badge>
                ))}
              </Flex>
              <Text size="md" mr="lg">
                <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm]}>
                  {article.content}
                </ReactMarkdown>
              </Text>
            </Stack>
          </Grid.Col>
        </>
      ) : (
        <Grid.Col span="auto">
          <Stack top="4px" align="flex-start">
            <Title size="h4">{article.title}</Title>
            <Stack spacing={0}>
              <Text color="dimmed" size="sm">
                {`on ${article.date.toLocaleDateString()}`}
              </Text>
              <Text color="dimmed" size="sm">{`by ${article.author}`}</Text>
            </Stack>
          </Stack>
          <Stack>
            <Flex gap="sm" mt="sm">
              {article.tags.map((tag) => (
                <Badge key={`${tag}key`}>{tag}</Badge>
              ))}
            </Flex>
            <Text mt={0} size="md">
              <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </Text>
          </Stack>
        </Grid.Col>
      )}
    </Grid>
  );
}
