import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/Main/HomePage';
import MusicalPage from '../pages/Gnere/MusicalPage';
import PlayPage from '../pages/Gnere/PlayPage';
import ConcertPage from '../pages/Gnere/ConcertPage';
import ClassicalPage from '../pages/Gnere/ClassicalPage';
import DancePage from '../pages/Gnere/DancePage';
import CircusPage from '../pages/Gnere/CircusPage';
import ComplexPage from '../pages/Gnere/ComplexPage';
import TraditionalPage from '../pages/Gnere/TraditionalPage';
import PopularDancePage from '../pages/Gnere/PopularDancePage';
import PerformanceDetailPage from '../pages/Performance/PerformanceDetailPage';
import SearchPage from '../pages/Main/SearchPage';

const HomeRouter: React.FC = () => {
  return (
    <Routes>
        {/* 루트 경로를 /performance로 리다이렉트 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/performance/musical" element={<MusicalPage />} />
      <Route path="/performance/play" element={<PlayPage />} />
      <Route path="/performance/concert" element={<ConcertPage />} />
      <Route path="/performance/classical" element={<ClassicalPage />} />
      <Route path="/performance/dance" element={<DancePage />} />
      <Route path="/performance/circus" element={<CircusPage />} />
      <Route path="/performance/complex" element={<ComplexPage />} />
      <Route path="/performance/traditional" element={<TraditionalPage />} />
      <Route path="/performance/popular-dance" element={<PopularDancePage />} />
      <Route path="/performance/:id" element={<PerformanceDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
};

export default HomeRouter; 