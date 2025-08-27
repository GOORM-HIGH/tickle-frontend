import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/main/HomePage';
import MusicalPage from '../pages/Gnere/MusicalPage';
import PlayPage from '../pages/Gnere/PlayPage';
import ConcertPage from '../pages/Gnere/ConcertPage';
import ClassicalPage from '../pages/Gnere/ClassicalPage';
import DancePage from '../pages/Gnere/DancePage';
import CircusPage from '../pages/Gnere/CircusPage';
import ComplexPage from '../pages/Gnere/ComplexPage';
import TraditionalPage from '../pages/Gnere/TraditionalPage';
import PopularDancePage from '../pages/Gnere/PopularDancePage';
import PerformanceDetailPage from '../pages/performance/PerformanceDetailPage';
import PerformanceCreatePage from '../pages/performance/PerformanceCreatePage';
import PerformanceHostPage from '../pages/performance/PerformanceHostPage';
import PerformanceEditPage from '../pages/performance/PerformanceEditPage';
import SearchPage from '../pages/main/SearchPage';
import ReservationPage from '../pages/reservation/ReservationPage';

import DynamicGenrePage from '../pages/Gnere/DynamicGenrePage';

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
      <Route path="/:performanceId/reservation" element={<ReservationPage />} />
      
      {/* 공연 상세 페이지 */}
      <Route path="/:id" element={<PerformanceDetailPage />} />
    </Routes>
  );
};

export default PerformanceRouter; 