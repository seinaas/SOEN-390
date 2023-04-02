import { formatDistanceToNowStrict } from 'date-fns';
import locale from 'date-fns/locale/en-US';
import { customFormatDistance } from '../../../src/utils/customFormat';

describe('customFormat', () => {
  it('should format seconds', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setSeconds(date.getSeconds() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1s');
  });
  it('should format minutes', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setMinutes(date.getMinutes() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1m');
  });
  it('should format hours', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setHours(date.getHours() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1h');
  });
  it('should format days', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setDate(date.getDate() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1d');
  });
  it('should format months', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setMonth(date.getMonth() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1m');
  });
  it('should format years', () => {
    const date = new Date();
    const result = formatDistanceToNowStrict(date.setFullYear(date.getFullYear() - 1), {
      locale: { ...locale, formatDistance: customFormatDistance },
    });
    expect(result).toEqual('1y');
  });
});
