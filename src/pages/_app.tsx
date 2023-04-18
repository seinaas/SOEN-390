import { type AppProps, type AppType } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { type NextPage } from 'next';
import { type ReactElement, type ReactNode } from 'react';
import { type Session } from 'next-auth';
import { type AbstractIntlMessages, NextIntlProvider } from 'next-intl';

import { api } from '../utils/api';
import { initPusher } from '../utils/pusher';

import '../styles/globals.css';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type PageProps = {
  session: Session;
  messages: AbstractIntlMessages;
};

export type MyAppProps = AppProps<PageProps> & {
  Component: NextPageWithLayout;
};

initPusher();
const MyApp = ({ Component, pageProps: { session, ...pageProps } }: MyAppProps) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <SessionProvider session={session}>
      <NextIntlProvider messages={pageProps.messages}>{getLayout(<Component {...pageProps} />)}</NextIntlProvider>
    </SessionProvider>
  );
};
export default api.withTRPC(MyApp);
