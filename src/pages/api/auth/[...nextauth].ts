/*
 *   NextAuth Authentication Set-Up
 *
 *
 *   The provided code is a JavaScript module exporting a function that returns NextAuth options for authentication. It imports
 *   the necessary dependencies, such as NextAuth and authentication providers like Google, Facebook, and Microsoft. The code
 *   includes a callback for creating a user session, as well as a callback for signing a user in using credentials. The PrismaAdapter
 *   is used to connect to a database. Lastly, the module exports a function that takes a Next.js request and response object and returns NextAuth options.
 */
/* istanbul ignore file */

import NextAuth, {
  type NextAuthOptions,
  type MicrosoftProfile,
  type FacebookProfile,
  type SessionOptions,
} from 'next-auth';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { encode, decode } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { getCookie, setCookie } from 'cookies-next';

import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db';

const sessionMaxAge = 30 * 24 * 60 * 60; // 30 days
const session: Partial<SessionOptions> = {
  strategy: 'database',
  maxAge: sessionMaxAge,
  updateAge: 24 * 60 * 60, // 24 hours
};

const adapter = PrismaAdapter(prisma);

export const getAuthOptions = (req: NextApiRequest, res: NextApiResponse): NextAuthOptions => ({
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.firstName = user.firstName;
        session.user.lastName = user.lastName;
      }
      return session;
    },
    async signIn({ user }) {
      if (
        req.query.nextauth?.includes('callback') &&
        req.query.nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        if (user) {
          const sessionToken = randomUUID();
          const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000);

          await adapter.createSession({
            userId: user.id,
            expires: sessionExpiry,
            sessionToken,
          });

          setCookie('next-auth.session-token', sessionToken, {
            expires: sessionExpiry,
            req,
            res,
          });
        }
      }
      return true;
    },
  },
  // Configure one or more authentication providers
  adapter,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'john@smith.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('No user found');
        }
        if (!user.password) {
          throw new Error('User does not have a password');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    {
      id: 'microsoft',
      name: env.AZURE_AD_B2C_TENANT_ID,
      type: 'oauth',
      version: '2.0',
      authorization: {
        params: { scope: 'openid profile email' },
        url: `https://login.microsoftonline.com/${env.AZURE_AD_B2C_TENANT_ID}/oauth2/v2.0/authorize`,
      },
      wellKnown: `https://login.microsoftonline.com/${env.AZURE_AD_B2C_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      accessTokenUrl: `https://login.microsoftonline.com/${env.AZURE_AD_B2C_TENANT_ID}/oauth2/v2.0/token`,
      requestTokenUrl: `https://login.microsoftonline.com/${env.AZURE_AD_B2C_TENANT_ID}/oauth2/v2.0/authorize`,
      profileUrl: 'https://graph.microsoft.com/oidc/userinfo',
      profile: (profile: MicrosoftProfile) => {
        return {
          id: profile.sub,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
        };
      },
      clientId: env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: env.AZURE_AD_B2C_CLIENT_SECRET,
    },
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      userinfo: 'https://graph.facebook.com/me?fields=email,first_name,last_name,picture',
      profile(profile: FacebookProfile) {
        return {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          image: profile.picture.data.url,
        };
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session,
  jwt: {
    encode: async ({ secret, token, maxAge }) => {
      if (
        req.query.nextauth?.includes('callback') &&
        req.query.nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        const cookie = getCookie('next-auth.session-token', { req });
        if (cookie) {
          return cookie as string;
        }

        return '';
      }

      return encode({ secret, token, maxAge });
    },
    decode: async ({ token, secret }) => {
      if (
        req.query.nextauth?.includes('callback') &&
        req.query.nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        return null;
      }

      return decode({ token, secret });
    },
  },
});

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  await NextAuth(req, res, getAuthOptions(req, res));
  // Do not put anything after this line
}
