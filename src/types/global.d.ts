// Use type safe message keys with `next-intl`
type Messages = typeof import('../../public/locales/en.json');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface IntlMessages extends Messages {}