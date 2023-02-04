import { type NextPage } from 'next';
import React, { useState } from 'react';
import UserCard from '../components/user-card';

interface Profile {
  name: string;
  occupation: string;
  location: string;
  bio: string;
  experience: string[];
}

const Profile: NextPage = () => {
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    occupation: 'Software Engineer',
    location: 'San Francisco',
    bio: 'I love to code and solve problems.',
    experience: ['Software Engineer', 'Frontend Developer', 'Backend Developer'],
  }); //Later on, this will be fetched from the database

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return (
    <div>
      <UserCard
        name={profile.name}
        occupation={profile.occupation}
        location={profile.location}
        bio={profile.bio}
        experience={profile.experience}
      />
      <button onClick={() => handleUpdateProfile({ ...profile, name: 'Jane Doe' })}>Update Profile</button>
    </div>
  );
};

export default Profile;
