const formatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const SECOND_IN_MILLISECONDS = 1000;

/**
 * Used for getting the most relevant time unit from now by
 * subsequently dividing the time difference by the amount of
 */
const INTERNAL_DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.MAX_SAFE_INTEGER, name: 'years' },
];

export function getMostRelevantTimeUnitFromNow(date: Date) {
  let time = (date.getTime() - new Date().getTime()) / SECOND_IN_MILLISECONDS;

  for (let i = 0; i < INTERNAL_DIVISIONS.length; i++) {
    const division = INTERNAL_DIVISIONS[i];

    if (Math.abs(time) < division.amount) {
      return { amount: time, name: division.name };
    }

    time /= division.amount;
  }

  return null;
}

export function fromNow(date: Date) {
  const timeUnit = getMostRelevantTimeUnitFromNow(date);

  return timeUnit ? formatter.format(Math.round(timeUnit.amount), timeUnit.name) : '';
}
