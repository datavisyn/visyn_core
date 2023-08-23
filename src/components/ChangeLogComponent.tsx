import React from 'react';
import { Stack, Group, Space, Affix, rem, Transition, Button, Input } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery, useWindowScroll } from '@mantine/hooks';
import { ChangeLogArticle } from './ChangeLogArticle';
import { IArticle } from '../base/interfaces';
import { ChangeLogFilter } from './ChangeLogFilter';
import { HelpOverlay } from './Overlay';

export function ChangeLogComponent({ data }: { data: IArticle[] }) {
  const [scroll, scrollTo] = useWindowScroll();
  const largerThanSm = useMediaQuery('(min-width: 768px)');
  // const allTags = React.useMemo(() => {
  //   Array.from(new Set(data.flatMap((article) => article.tags)));
  // }, [data]);
  // const allTimes = React.useMemo(() => {
  //   Array.from(new Set(data.flatMap((article) => article.date)));
  // }, [data]);
  const allTags = Array.from(new Set(data.flatMap((article) => article.tags)));
  const allTimes = Array.from(new Set(data.flatMap((article) => article.date)));

  const [checkedTags, setCheckedTags] = React.useState<string[]>([]);
  const [checkedTimes, setCheckedTimes] = React.useState<Date[]>([]);
  const [showedArticles, setShowedArticles] = React.useState<IArticle[]>([]);

  React.useEffect(() => {
    const filteredData = data.filter(
      (article) =>
        checkedTags.length > 0 &&
        checkedTimes.length > 0 &&
        (checkedTimes.includes(article.date) || checkedTags.reduce((a, c) => article.tags.includes(c), false)),
    );

    setShowedArticles(checkedTags.length > 0 && checkedTimes.length > 0 ? filteredData : data);
  }, [allTags, checkedTags, checkedTimes, data]);

  return (
    <Stack m="md" h="auto">
      <Group position="right" mx="5%" spacing="sm">
        <Input placeholder="Search" onChange={null} />
        <ChangeLogFilter
          tags={allTags}
          times={allTimes}
          checkedTags={checkedTags}
          setCheckedTags={setCheckedTags}
          checkedTimes={checkedTimes}
          setCheckedTimes={setCheckedTimes}
        />
      </Group>
      {showedArticles.length > 0 ? (
        showedArticles.map((article) => (
          <ChangeLogArticle article={article} largerThanSm={largerThanSm} key={article.version} checkedTags={checkedTags} setCheckedTags={setCheckedTags} />
        ))
      ) : (
        <HelpOverlay text="There are no changelogs within the specified filters" showIcon />
      )}
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
