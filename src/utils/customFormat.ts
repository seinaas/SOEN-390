/*
 *		Custom Format Distance Locale
 *
 *
 *		The code defines a custom locale for date-fns' formatDistance function to format the time since something was created using shorthand units.
 *		The locale includes strings for various time units, such as seconds, minutes, hours, days, weeks, months, and years. The customFormatDistance
 *		function takes a token representing the time unit, a count representing the number of units, and an optional options object. It returns the
 *		formatted string using the custom locale with the appropriate count for the specified time unit.
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
