import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PointChargePage, PointHistoryPage } from '../feat-point/pages';

const PointRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/charge" element={<PointChargePage />} />
      <Route path="/history" element={<PointHistoryPage />} />
    </Routes>
  );
};

export default PointRouter;
