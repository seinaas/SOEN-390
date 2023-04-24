/*
 *		Additional Field Types Creator
 *
 *
 *		This file extends the default types provided by the next-auth library, adding additional fields to the Session and User interfaces, as well as updating
 *		the MicrosoftProfile and FacebookProfile interfaces. Specifically, the Session interface includes fields such as education, jobs, and bio for the logged
 *		in user, while the User interface includes fields such as headline, volunteering, and languages. Finally, the MicrosoftProfile and FacebookProfile interfaces
 *		have been updated to include the email, given_name, and family_name fields.
 */
import { type DefaultSession } from 'next-auth';
import { type AzureB2CProfile as DefaultAzureB2CProfile } from 'next-auth/providers/azure-ad-b2c';
import { type FacebookProfile as DefaultFacebookProfile } from 'next-auth/providers/facebook';

type Job = {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description: string;
};

type Education = {
  school: string;
  location: string;
  degree: string;
  startDate: Date;
  endDate?: Date;
  description: string;
};
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
      education?: Education[];
      jobs?: Job[];
      bio?: string;
      email?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  // TODO: Update user type to match your database schema
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    education?: Education[];
    jobs?: Job[];
    connections?: string;
    bio?: string;
    volunteering?: string;
    skills?: string;
    recommendations?: string;
    courses?: string;
    projects?: string;
    awards?: string;
    languages?: string;
    email: string;
    image?: string;
  }

  interface MicrosoftProfile extends DefaultAzureB2CProfile {
    given_name: string;
    family_name: string;
    email: string;
  }

  interface FacebookProfile extends DefaultFacebookProfile {
    email: string;
    first_name: string;
    last_name: string;
  }
}
