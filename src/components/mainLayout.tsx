/*
 *		Main Page Layout Template
 *
 *
 *		This is a simplistic template design for a React page in general. It is used to wrap each individual specifc page, and keep the website structure consistent.
 */
import Header from './header';

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <main className='flex h-full flex-grow flex-col'>
        <Header />
        {children}
      </main>
    </>
  );
};

export default MainLayout;
