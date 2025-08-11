import React, { ReactNode } from 'react';
import Header from './header/Header';
import Footer from './footer/Footer';
import ChatFloatingButton from '../chat/ChatFloatingButton';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
      <ChatFloatingButton />
    </div>
  );
};

export default Layout; 