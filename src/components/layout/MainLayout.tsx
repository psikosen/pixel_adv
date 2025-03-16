import React, { ReactNode } from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-[300px_1fr_300px] gap-4 p-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
