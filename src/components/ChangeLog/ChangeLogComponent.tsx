import React from 'react';
import { Stack, Group, Space, Affix, rem, Transition, Button, TextInput, Pagination } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery, useWindowScroll } from '@mantine/hooks';

import { ChangeLogArticle } from './ChangeLogArticle';
import { IChangeLogArticle } from './interfaces';
import { ChangeLogFilter } from './ChangeLogFilter';
import { HelpOverlay } from './Overlay';

function IsDateBetween(startDate: Date, endDate: Date, currentDate: Date) {
  if (startDate != null && endDate != null) {
    return startDate <= currentDate && currentDate <= endDate;
  }
  return false;
}

const ARTICLES_ON_PAGE = 3;

export function ChangeLogComponent({ data }: { data: IChangeLogArticle[] }) {
  const [scroll, scrollTo] = useWindowScroll();
  const [activePage, setPage] = React.useState(1);
  const largerThanSm = useMediaQuery('(min-width: 768px)');
  const allTags = React.useMemo(() => {
    return Array.from(new Set(data.flatMap((article) => article.tags)));
  }, [data]);
  const allTimes = React.useMemo(() => {
    return Array.from(new Set(data.flatMap((article) => article.date)));
  }, [data]);

  const [checkedTags, setCheckedTags] = React.useState<string[]>([]);
  const [showedArticles, setShowedArticles] = React.useState<IChangeLogArticle[]>([]);
  const [valueSelected, setValueSelected] = React.useState<[Date | null, Date | null]>([null, null]);

  const [search, setSearch] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState<IChangeLogArticle[]>([]);

  React.useEffect(() => {
    const filteredData = data.filter(
      (article) => IsDateBetween(valueSelected[0], valueSelected[1], article.date) || checkedTags.reduce((a, c) => a || article.tags.includes(c), false),
    );
    setShowedArticles(checkedTags.length > 0 || (valueSelected[0] !== null && valueSelected[1] !== null) ? filteredData : data);
    // if (searchFilter) {
    //   setShowedArticles((prevstate) => [...prevstate, searchFilter.forEach((sf) => sf)]);
    // }
  }, [allTags, checkedTags, data, valueSelected]);

  return (
    <Stack m="md" h="auto">
      <Group position="right" mx="5%" spacing="sm">
        <TextInput placeholder="Search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
        <ChangeLogFilter
          tags={allTags}
          times={allTimes}
          checkedTags={checkedTags}
          setCheckedTags={setCheckedTags}
          valueSelected={valueSelected}
          setValueSelected={setValueSelected}
        />
      </Group>
      {showedArticles.length > 0 ? (
        showedArticles
          .slice((activePage - 1) * ARTICLES_ON_PAGE, activePage * ARTICLES_ON_PAGE)
          .map((article) => (
            <ChangeLogArticle
              article={article}
              largerThanSm={largerThanSm}
              key={data.indexOf(article)}
              checkedTags={checkedTags}
              setCheckedTags={setCheckedTags}
              search={search}
              setSearchFilter={setSearchFilter}
            />
          ))
      ) : (
        <HelpOverlay text="There are no changelogs within the specified filters" showIcon />
      )}
      <Space h="lg" />
      <Pagination value={activePage} onChange={setPage} total={data.length / ARTICLES_ON_PAGE} position="center" />

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
