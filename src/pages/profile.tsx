import { type NextPage } from 'next';
import React, { useState } from 'react';
import UserCard from '../components/user-card';

interface Profile {
  name: string;
  occupation: string;
}

const Profile: NextPage = () => {
  const [profile, setProfile] = useState<Profile>({
    name: 'John Doe',
    occupation: 'Software Engineer',
  }); //Later on, this will be fetched from the database

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return (
    <div>
      <UserCard name={profile.name} occupation={profile.occupation} />
      <button onClick={() => handleUpdateProfile({ ...profile, name: 'Jane Doe' })}>Edit Profile</button>
    </div>
  );
};

export default Profile;
