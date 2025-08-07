import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../home/pages/Main/HomePage';
import MusicalPage from '../home/pages/Gnere/MusicalPage';
import PlayPage from '../home/pages/Gnere/PlayPage';
import ConcertPage from '../home/pages/Gnere/ConcertPage';
import ClassicalPage from '../home/pages/Gnere/ClassicalPage';
import DancePage from '../home/pages/Gnere/DancePage';
import CircusPage from '../home/pages/Gnere/CircusPage';
import ComplexPage from '../home/pages/Gnere/ComplexPage';
import TraditionalPage from '../home/pages/Gnere/TraditionalPage';
import PopularDancePage from '../home/pages/Gnere/PopularDancePage';
import PerformanceDetailPage from '../home/pages/Performance/PerformanceDetailPage';
import SearchPage from '../home/pages/Main/SearchPage';
import ReservationPage from '../pages/reservation/ReservationPage';

const PerformanceRouter: React.FC = () => {
  return (
    <Routes>
      {/* 홈페이지 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/musical" element={<MusicalPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/concert" element={<ConcertPage />} />
      <Route path="/classical" element={<ClassicalPage />} />
      <Route path="/dance" element={<DancePage />} />
      <Route path="/circus" element={<CircusPage />} />
      <Route path="/complex" element={<ComplexPage />} />
      <Route path="/traditional" element={<TraditionalPage />} />
      <Route path="/popular-dance" element={<PopularDancePage />} />
      <Route path="/:id" element={<PerformanceDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      {/* 예매 페이지 */}
      <Route path="/:performanceId/reservation" element={<ReservationPage />} />
    </Routes>
  );
};

export default PerformanceRouter; 