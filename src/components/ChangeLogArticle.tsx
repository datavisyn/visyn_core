import { Flex, Stack, Text, Badge, Grid, Title, Box } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import * as React from 'react';
import { IArticle } from '../base';

export function ChangeLogArticle({
  article,
  largerThanSm,
  checkedTags,
  setCheckedTags,
}: {
  article: IArticle;
  largerThanSm: boolean;
  checkedTags: { [k: string]: boolean };
  setCheckedTags: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
}) {
  return (
    <Grid py={0} mx="10%">
      <Grid.Col span="content" py={0}>
        <Flex gap={0} align="center" direction="column" h="100%">
          <Box
            sx={(theme) => ({
              display: 'inline',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              top: '4px',
              position: 'sticky',
              backgroundColor: theme.colors[theme.primaryColor][6],
              marginTop: '13px',
            })}
          />
          <Box
            sx={(theme) => ({
              display: 'flex',
              background: theme.colors[theme.primaryColor][6],
              height: '100%',
              width: '3px',
              top: '4px',
              position: 'sticky',
              marginBottom: '-13px',
            })}
          />
        </Flex>
      </Grid.Col>
      {largerThanSm ? (
        <>
          <Grid.Col span={2}>
            <Stack top="4px" pos="sticky" align="flex-start">
              <Title size="h4" lineClamp={2}>
                {article.title ? article.title : article.version}
              </Title>
              <Stack spacing={0}>
                {article.title ? (
                  <Text color="dimmed" size="sm">
                    {article.version}
                  </Text>
                ) : null}
                <Text color="dimmed" size="sm">
                  {`on ${article.date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </Text>
                <Text color="dimmed" size="sm">{`by ${article.author}`}</Text>
                <Flex gap="sm" mt="xs" ml={0}>
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag + article.version}
                      role="button"
                      onClick={() =>
                        checkedTags[tag]
                          ? setCheckedTags((prevstate) => ({ ...prevstate, [tag]: false }))
                          : setCheckedTags((prevstate) => ({ ...prevstate, [tag]: true }))
                      }
                      styles={(theme) => ({
                        root: { ':hover': theme.fn.hover({ backgroundColor: theme.fn.darken(theme.colors.blue[1], 0.05) }) },
                      })}
                      variant={checkedTags[tag] ? 'filled' : 'light'}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto">
            <Text size="md" mr="lg">
              <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm, remarkFrontmatter]}>
                {article.content}
              </ReactMarkdown>
            </Text>
          </Grid.Col>
        </>
      ) : (
        <Grid.Col span="auto">
          <Stack top="4px" align="flex-start">
            <Title size="h4" lineClamp={2}>
              {article.title ? article.title : article.version}
            </Title>
            <Stack spacing={0}>
              {article.title ? (
                <Text color="dimmed" size="sm">
                  {article.version}
                </Text>
              ) : null}
              <Text color="dimmed" size="sm">
                {`on ${article.date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </Text>
              <Text color="dimmed" size="sm">{`by ${article.author}`}</Text>
            </Stack>
          </Stack>
          <Stack>
            <Flex gap="sm" mt="sm">
              {article.tags.map((tag) => (
                <Badge
                  key={tag}
                  role="button"
                  onClick={() =>
                    checkedTags[tag]
                      ? setCheckedTags((prevstate) => ({ ...prevstate, [tag]: false }))
                      : setCheckedTags((prevstate) => ({ ...prevstate, [tag]: true }))
                  }
                  styles={(theme) => ({
                    root: { ':hover': theme.fn.hover({ backgroundColor: theme.fn.darken(theme.colors.blue[1], 0.05) }) },
                  })}
                  variant={checkedTags[tag] ? 'filled' : 'light'}
                >
                  {tag}
                </Badge>
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
