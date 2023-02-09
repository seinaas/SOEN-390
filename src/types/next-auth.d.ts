import { type DefaultSession } from 'next-auth';
import { type AzureB2CProfile as DefaultAzureB2CProfile } from 'next-auth/providers/azure-ad-b2c';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // TODO: Include only necessary fields in the session user
  interface Session {
    user?: {
      id: string;
      firstName?: string;
      lastName?: string;
      education?: string;
      job?: string;
      bio?: string;
      email?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  // TODO: Update user type to match your database schema
  interface User {
    id: string;
    firstName: string;
    lastName?: string;
    education?: string;
    job?: string;
    connections?: string;
    bio?: string;
    volunteering?: string;
    skills?: string;
    recommendations?: string;
    courses?: string;
    projects?: string;
    awards?: string;
    languages?: string;
    email?: string;
    image?: string;
  }

  interface AzureB2CProfile extends DefaultAzureB2CProfile {
    given_name: string;
    family_name: string;
  }
}
