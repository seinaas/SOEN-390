/* istanbul ignore file */

import NextAuth, { type NextAuthOptions, type MicrosoftProfile, type FacebookProfile } from 'next-auth';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db';

export const authOptions: NextAuthOptions = {
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
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
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
        console.log(profile);
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
        console.log(profile);
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
};

export default NextAuth(authOptions);
