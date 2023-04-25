/*
 *		Message Type Safety Enabler
 *
 *
 *		This file defines a type Messages based on the structure of the en.json file located in the public/locales directory. It then declares an IntlMessages interface that extends the
 *      Messages type. The IntlMessages interface can be used to enforce type safety when accessing the translated message keys within the application. The
 *      @typescript-eslint/no-empty-interface comment disables an ESLint rule that prohibits empty interfaces, which is necessary in this case since IntlMessages extends Messages and has no
 *      additional properties of its own.
 */
// Use type safe message keys with `next-intl`
type Messages = typeof import('../../public/locales/en.json');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface IntlMessages extends Messages {}
