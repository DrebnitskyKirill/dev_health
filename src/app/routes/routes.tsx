import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const DashboardPage = lazy(() => import("../../pages/dashboard/DashboardPage"));
const PosturePage = lazy(() => import("../../pages/posture/PosturePage"));
const VisionPage = lazy(() => import("../../pages/vision/VisionPage"));
const WorkModePage = lazy(() => import("../../pages/workmode/WorkModePage"));
const SettingsPage = lazy(() => import("../../pages/settings/SettingsPage"));

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<div className="p-8 text-center">Загрузка...</div>}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/posture" element={<PosturePage />} />
      <Route path="/vision" element={<VisionPage />} />
      <Route path="/workmode" element={<WorkModePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </Suspense>
); 
