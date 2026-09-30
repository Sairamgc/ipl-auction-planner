/**
 * Age in whole years on `onDate` (D9: the auction date). Both dates are
 * `YYYY-MM-DD`. A 29 February birthday falls on 1 March in non-leap years.
 */
export function ageOn(dateOfBirth: string, onDate: string): number {
  const born = parseDate(dateOfBirth);
  const on = parseDate(onDate);

  const birthdayThisYear =
    born.month === 2 && born.day === 29 && !isLeapYear(on.year)
      ? { month: 3, day: 1 }
      : { month: born.month, day: born.day };
  const hadBirthday =
    on.month > birthdayThisYear.month ||
    (on.month === birthdayThisYear.month && on.day >= birthdayThisYear.day);

  return on.year - born.year - (hadBirthday ? 0 : 1);
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Expected YYYY-MM-DD, got "${value}"`);
  const [, year, month, day] = match.map(Number) as [
    number,
    number,
    number,
    number,
  ];
  return { year, month, day };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
