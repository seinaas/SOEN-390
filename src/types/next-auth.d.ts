import { type DefaultSession } from 'next-auth';

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
}
