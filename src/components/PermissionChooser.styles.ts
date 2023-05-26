import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  grid: {
    display: 'grid',
    // minmax helps here to make it look good across resolutions ~450 - 1800
    gridTemplateColumns: 'minmax(5rem, 0.5fr) minmax(10rem, 2fr) minmax(20rem, 1fr)',
    alignItems: 'center',
    columnGap: theme.spacing.md,
    rowGap: theme.spacing.xs,
  },
  fullRow: {
    gridColumnStart: 1,
    gridColumnEnd: 4,
  },
  chevron: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 200ms ease',

    '&[data-rotate="true"]': {
      transform: 'rotate(180deg)',
    },
  },
}));
