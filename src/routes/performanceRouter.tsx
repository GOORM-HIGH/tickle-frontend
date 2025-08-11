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
import PerformanceCreatePage from '../home/pages/Performance/PerformanceCreatePage';
import PerformanceHostPage from '../home/pages/Performance/PerformanceHostPage';
import PerformanceEditPage from '../home/pages/Performance/PerformanceEditPage';
import SearchPage from '../home/pages/Main/SearchPage';
import ReservationPage from '../pages/reservation/ReservationPage';

import DynamicGenrePage from '../home/pages/Gnere/DynamicGenrePage';

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
      <Route path="/create" element={<PerformanceCreatePage />} />
      <Route path="/host" element={<PerformanceHostPage />} />
      <Route path="/edit/:performanceId" element={<PerformanceEditPage />} />
      <Route path="/search" element={<SearchPage />} />
      
      {/* 동적 장르 페이지 */}
      <Route path="/genre/:genreId" element={<DynamicGenrePage />} />
      
      {/* 예매 페이지 */}
      <Route path="/performance/:performanceId/reservation" element={<ReservationPage />} />
      
      {/* 공연 상세 페이지 */}
      <Route path="/:id" element={<PerformanceDetailPage />} />
    </Routes>
  );
};

export default PerformanceRouter; 