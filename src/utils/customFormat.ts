/**
 * This is a custom locale for date-fns' formatDistance function.
 * It is used to format the time since something was created using shorthand units.
 */
const formatDistanceLocale = {
  lessThanXSeconds: '{{count}}s',
  xSeconds: '{{count}}s',
  halfAMinute: '30s',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}m',
  xMonths: '{{count}}m',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
};

export const customFormatDistance = (token: keyof typeof formatDistanceLocale, count: string, options?: any) => {
  return formatDistanceLocale[token].replace('{{count}}', count);
};
