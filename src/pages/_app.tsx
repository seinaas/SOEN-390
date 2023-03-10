import { type AppProps, type AppType } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { type NextPage } from 'next';
import { useEffect, type ReactElement, type ReactNode } from 'react';
import { type Session } from 'next-auth';

import { api } from '../utils/api';
import { disconnectPusher, initPusher } from '../utils/pusher';

import '../styles/globals.css';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type MyAppProps = AppProps & {
  Component: NextPageWithLayout;
  pageProps: AppProps['pageProps'] & {
    session: Session;
  };
};

initPusher();
const MyApp = (({ Component, pageProps: { session, ...pageProps } }: MyAppProps) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  useEffect(() => {
    return () => {
      disconnectPusher();
    };
  }, []);
  return <SessionProvider session={session as Session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>;
}) as AppType;
export default api.withTRPC(MyApp);
