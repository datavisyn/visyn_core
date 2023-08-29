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
    const cuDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    return startDate <= cuDate && cuDate <= endDate;
  }
  return false;
}

const ARTICLES_ON_PAGE = 5;

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
    const valueSelected0UTC = valueSelected[0]
      ? new Date(valueSelected[0].getUTCFullYear(), valueSelected[0].getUTCMonth(), valueSelected[0].getUTCDate())
      : null;
    const valueSelected1UTC = valueSelected[1]
      ? new Date(valueSelected[1].getUTCFullYear(), valueSelected[1].getUTCMonth(), valueSelected[1].getUTCDate())
      : null;
    const filteredData = data.filter(
      (article) => IsDateBetween(valueSelected0UTC, valueSelected1UTC, article.date) || checkedTags.reduce((a, c) => a || article.tags.includes(c), false),
    );
    // searchFilter?.forEach((sfarticle) => filteredData.push(sfarticle));
    setShowedArticles(checkedTags.length > 0 || (valueSelected0UTC !== null && valueSelected1UTC !== null) ? filteredData : data);
  }, [allTags, checkedTags, data, searchFilter, valueSelected]);

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
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
            />
          ))
      ) : (
        <HelpOverlay text="There are no changelogs within the specified filters" showIcon />
      )}
      <Space h="lg" />
      {showedArticles.length > 0 && showedArticles.length / ARTICLES_ON_PAGE > 1 ? (
        <Pagination
          value={activePage}
          onChange={(value) => {
            setPage(value);
            scrollTo({ y: 0 });
          }}
          total={showedArticles.length / ARTICLES_ON_PAGE}
          position="center"
        />
      ) : null}

      <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) =>
            largerThanSm ? (
              <Button
                leftIcon={<FontAwesomeIcon icon={faArrowUp} size="xs" style={{ color: 'white' }} />}
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
              >
                Scroll to top
              </Button>
            ) : (
              <Button style={transitionStyles} onClick={() => scrollTo({ y: 0 })}>
                <FontAwesomeIcon icon={faArrowUp} size="xs" style={{ color: 'white' }} />
              </Button>
            )
          }
        </Transition>
      </Affix>
    </Stack>
  );
}
