import { Flex, Stack, Text, Badge, Grid, Title, Box, SimpleGrid, darken } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import * as React from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { IChangeLogArticle } from './interfaces';

function HandleSearch(
  search: string,
  currentArticle: IChangeLogArticle,
  searchFilter: IChangeLogArticle[],
  setSearchFilter: React.Dispatch<React.SetStateAction<IChangeLogArticle[]>>,
) {
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const toSearchIn = currentArticle.content;

  const contentToHighlight = React.useMemo(() => {
    if (!debouncedSearch) {
      return toSearchIn;
    }
    const regex = new RegExp(debouncedSearch, 'ig');
    if (toSearchIn.search(regex) > 0) {
      // if (!searchFilter?.includes(currentArticle)) {
      //   setSearchFilter((prevstate) => [...prevstate, currentArticle]);
      // }
      return toSearchIn.replaceAll(regex, (match) => `<mark>${match}</mark>`);
    }
    return toSearchIn;
  }, [debouncedSearch, toSearchIn]);

  return contentToHighlight ? <ReactMarkdown remarkPlugins={[remarkGfm, remarkFrontmatter]}>{contentToHighlight}</ReactMarkdown> : null;
}

export function ChangeLogArticle({
  article,
  largerThanSm,
  checkedTags,
  setCheckedTags,
  search,
  searchFilter,
  setSearchFilter,
}: {
  article: IChangeLogArticle;
  largerThanSm: boolean;
  checkedTags: string[];
  setCheckedTags: React.Dispatch<React.SetStateAction<string[]>>;
  search: string;
  searchFilter: IChangeLogArticle[];
  setSearchFilter: React.Dispatch<React.SetStateAction<IChangeLogArticle[]>>;
}) {
  return (
    <Grid py={0} mx="10%">
      <Grid.Col span="content" py={0}>
        <Flex gap={0} align="center" direction="column" h="100%">
          <Box
            style={(theme) => ({
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
            style={(theme) => ({
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
              <Stack gap={0}>
                {article.title ? (
                  <Text c="dimmed" size="sm">
                    {article.version}
                  </Text>
                ) : null}
                <Text c="dimmed" size="sm">
                  {`on ${article.date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </Text>
                <Text c="dimmed" size="sm">{`by ${article.author}`}</Text>
                <SimpleGrid cols={3} spacing="sm" mt="xs" ml={0}>
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag + article.version}
                      role="button"
                      onClick={() =>
                        checkedTags.includes(tag)
                          ? setCheckedTags(() => checkedTags.filter((ct) => ct !== tag))
                          : setCheckedTags((prevstate) => [...prevstate, tag])
                      }
                      styles={(theme) => ({
                        root: { ':hover': { backgroundColor: darken(theme.colors.blue[1], 0.05) } },
                      })}
                      variant={checkedTags.includes(tag) ? 'filled' : 'light'}
                    >
                      {tag}
                    </Badge>
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto">
            <Text size="md" mr="lg">
              {search ? (
                HandleSearch(search, article, searchFilter, setSearchFilter)
              ) : (
                <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm, remarkFrontmatter]}>
                  {article.content}
                </ReactMarkdown>
              )}
            </Text>
          </Grid.Col>
        </>
      ) : (
        <Grid.Col span="auto">
          <Stack top="4px" align="flex-start">
            <Title size="h4" lineClamp={2}>
              {article.title ? article.title : article.version}
            </Title>
            <Stack gap={0}>
              {article.title ? (
                <Text c="dimmed" size="sm">
                  {article.version}
                </Text>
              ) : null}
              <Text c="dimmed" size="sm">
                {`on ${article.date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </Text>
              <Text c="dimmed" size="sm">{`by ${article.author}`}</Text>
            </Stack>
          </Stack>
          <Stack>
            <SimpleGrid cols={3} spacing="sm" mt="sm">
              {article.tags.map((tag) => (
                <Badge
                  key={tag}
                  role="button"
                  onClick={() =>
                    checkedTags.includes(tag)
                      ? setCheckedTags(() => checkedTags.filter((ct) => ct !== tag))
                      : setCheckedTags((prevstate) => [...prevstate, tag])
                  }
                  styles={(theme) => ({
                    root: { ':hover': { backgroundColor: darken(theme.colors.blue[1], 0.05) } },
                  })}
                  variant={checkedTags[tag] ? 'filled' : 'light'}
                >
                  {tag}
                </Badge>
              ))}
            </SimpleGrid>
            <Text mt={0} size="md">
              {search ? (
                HandleSearch(search, article, searchFilter, setSearchFilter)
              ) : (
                <ReactMarkdown linkTarget="_blank" remarkPlugins={[remarkGfm, remarkFrontmatter]}>
                  {article.content}
                </ReactMarkdown>
              )}
            </Text>
          </Stack>
        </Grid.Col>
      )}
    </Grid>
  );
}
