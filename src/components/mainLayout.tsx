import Header from './header';

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <main className='flex flex-grow flex-col'>
        <Header />
        {children}
      </main>
    </>
  );
};

export default MainLayout;
