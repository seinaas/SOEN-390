/*
 *		App Page Initializer
 *
 *
 *		The code defines a custom NextPageWithLayout type for Next.js. It also defines a MyApp component that extends AppProps. The MyApp component
 *		initializes Pusher, a real-time messaging service, and wraps the Component with SessionProvider from next-auth/react. It also defines pageProps
 *		that include session. Finally, the component is exported with api.withTRPC.
 */
import { type AppProps, type AppType } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { type NextPage } from 'next';
import { type ReactElement, type ReactNode } from 'react';
import { type Session } from 'next-auth';

import { api } from '../utils/api';
import { initPusher } from '../utils/pusher';

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
  return <SessionProvider session={session as Session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>;
}) as AppType;
export default api.withTRPC(MyApp);
