import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Footer from './footer/Footer';
import ChatFloatingButton from '../chat/ChatFloatingButton';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main"><Outlet /></main>
      <Footer />
      <ChatFloatingButton />
    </div>
  );
};