import React from 'react';

interface UserCardProps {
  name: string;
  occupation: string;
}
//Card component
const UserCard: React.FC<UserCardProps> = ({ name, occupation }) => {
  return (
    <div className='flex flex-col items-center rounded-lg bg-white p-6 shadow-lg'>
      <header className='text-2xl font-bold'>
        <h1>{name}</h1>
        <p className='text-sm font-medium text-gray-600'>{occupation}</p>
      </header>

      <main>
        <section className='flex flex-col'>
          <button className='text-sm font-medium text-black'>Connections</button>
          <button className='text-sm font-medium text-black'>Saved Jobs</button>
          <button className='text-sm font-medium text-black'>Events</button>
          <button className='text-sm font-medium text-black'>Groups</button>
        </section>
        <section>
          <button className='text-slate rounded-2xl bg-primary-100 pt-4 pb-4 pr-2 pl-2 font-medium text-white'>
            Edit Profile
          </button>
        </section>
      </main>
    </div>
  );
};
export default UserCard;
