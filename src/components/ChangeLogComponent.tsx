import React from 'react';
import { Stack, Text, Group, Space, Affix, rem, Transition, Button } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useMediaQuery, useWindowScroll } from '@mantine/hooks';
import { ChangeLogArticle } from './ChangeLogArticle';
import { IArticle } from '../base/interfaces';
import { ChangeLogFilter } from './ChangeLogFilter';
import { HelpOverlay } from './Overlay';

function FIsChecked(article: IArticle, checkedTags: Map<string, boolean>): boolean {
  for (let i = 0; i < article.tags.length; i++) {
    if (checkedTags.get(article.tags[i])) {
      return true;
    }
  }
  return false;
}

function DateThisWeek(date: Date) {
  const WEEK_LENGTH_MS = 604800000;
  const lastMonday = new Date();
  lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() - 1));
  return lastMonday.getTime() <= date.getTime() && date.getTime() < lastMonday.getTime() + WEEK_LENGTH_MS;
}

function DateLastWeek(date: Date) {
  const WEEK_LENGTH_MS = 604800000;
  const lastMonday = new Date();
  lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() - 8));
  return lastMonday.getTime() <= date.getTime() && date.getTime() < lastMonday.getTime() + WEEK_LENGTH_MS;
}

function DateThisMonth(date: Date) {
  const thisMonth = new Date().getMonth();
  return thisMonth === date.getMonth();
}

function DateLastMonth(date: Date) {
  let lastMonth = new Date().getMonth() - 1;
  lastMonth = lastMonth > 0 ? lastMonth : (lastMonth = 11);
  return lastMonth === date.getMonth();
}
function DateThisYear(date: Date) {
  return date.getFullYear() === new Date().getFullYear();
}

export function ChangeLogComponent({ data }: { data: IArticle[] }) {
  const [scroll, scrollTo] = useWindowScroll();
  const largerThanSm = useMediaQuery('(min-width: 768px)');
  const allTags = [];
  const allTimes = [];
  const extendedDateFilterOptions = React.useMemo(
    () => [
      { name: 'this week', func: DateThisWeek },
      { name: 'last week', func: DateLastWeek },
      { name: 'this month', func: DateThisMonth },
      { name: 'last month', func: DateLastMonth },
      { name: 'this year', func: DateThisYear },
    ],
    [],
  );

  data.map((article) => article.tags.map((tag) => (allTags.includes(tag) ? null : allTags.push(tag))));
  data.map((article) => (allTimes.includes(article.date) ? null : allTimes.push(article.date)));

  const [checkedTags, setCheckedTags] = React.useState<Map<string, boolean>>(new Map(allTags.map((tag) => [tag, false])));
  const [checkedTimes, setCheckedTimes] = React.useState<Map<Date, boolean>>(new Map(allTimes.map((time) => [time, false])));
  const [checkedExtendedTimes, setCheckedExtendedTimes] = React.useState<Map<string, boolean>>(
    new Map(extendedDateFilterOptions.map((eo) => [eo.name, false])),
  );
  const [showedArticles, setShowedArticles] = React.useState<Map<IArticle, boolean>>(new Map(data.map((article) => [article, true])));

  React.useEffect(() => {
    let anyChecked = false;
    for (const value of checkedTags.values()) {
      if (value) {
        anyChecked = true;
        break;
      } else {
        continue;
      }
    }
    for (const value of checkedTimes.values()) {
      if (value) {
        anyChecked = true;
        break;
      } else {
        continue;
      }
    }

    for (const value of checkedExtendedTimes.values()) {
      if (value) {
        anyChecked = true;
        break;
      } else {
        continue;
      }
    }

    data.map((article) =>
      anyChecked
        ? checkedTimes.get(article.date) || FIsChecked(article, checkedTags)
          ? setShowedArticles((prevstate) => new Map(prevstate.set(article, true)))
          : setShowedArticles((prevstate) => new Map(prevstate.set(article, false)))
        : setShowedArticles((prevstate) => new Map(prevstate.set(article, true))),
    );

    for (const entry of checkedExtendedTimes.entries()) {
      if (entry[1]) {
        const usedFunction = extendedDateFilterOptions.find((exdf) => exdf.name === entry[0]);
        data.map((article) => (usedFunction.func(article.date) ? setShowedArticles((prevstate) => new Map(prevstate.set(article, true))) : null));
      }
    }
  }, [checkedExtendedTimes, checkedTags, checkedTimes, data, extendedDateFilterOptions, showedArticles]);

  return (
    <Stack m="md" h="auto">
      <Group position="right" mx="5%">
        <ChangeLogFilter
          tags={allTags}
          times={allTimes}
          extendedTimes={extendedDateFilterOptions.map((edf) => edf.name)}
          checkedTags={checkedTags}
          setCheckedTags={setCheckedTags}
          checkedTimes={checkedTimes}
          setCheckedTimes={setCheckedTimes}
          checkedExtendedTimes={checkedExtendedTimes}
          setCheckedExtendedTimes={setCheckedExtendedTimes}
        />
      </Group>
      {
        data.map((article) =>
          showedArticles.get(article) ? (
            <ChangeLogArticle article={article} largerThanSm={largerThanSm} key={article.title} checkedTags={checkedTags} setCheckedTags={setCheckedTags} />
          ) : null,
        )
        // (<HelpOverlay text="There are no changelogs within the specified filters" showIcon />)
      }
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
