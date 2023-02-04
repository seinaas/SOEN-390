import React from 'react';

interface UserCardProps {
  name: string;
  occupation: string;
  location: string;
  bio: string;
  experience?: string[];
}
//Card component
const UserCard: React.FC<UserCardProps> = ({ name, occupation, location, bio, experience }) => {
  return (
    <div className='flex-auto rounded-lg bg-white p-6 shadow-lg'>
      <header className='text-2xl font-bold'>
        <h1>{name}</h1>
        <p className='text-sm font-medium text-gray-600'>Occupation: {occupation}</p>
        <p className='text-sm font-medium text-gray-600'>Location: {location}</p>
      </header>
      <main>
        <section>
          <h2>About</h2>
          <p>{bio}</p>
        </section>
        <section>
          <h2>Experience</h2>
          <ul>
            {experience?.map((exp) => (
              <li key={exp}>{exp}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};
export default UserCard;
