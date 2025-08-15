import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useLanguage } from "../../shared/context/LanguageContext";

const DashboardPage = lazy(() => import("../../pages/dashboard/DashboardPage"));
const PosturePage = lazy(() => import("../../pages/posture/PosturePage"));
const VisionPage = lazy(() => import("../../pages/vision/VisionPage"));
const WorkModePage = lazy(() => import("../../pages/workmode/WorkModePage"));
const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("../../pages/profile/ProfilePage"));
const SubscriptionPage = lazy(() => import("../../pages/subscription/SubscriptionPage"));

export const AppRoutes: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('common.loading')}</div>}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/posture" element={<PosturePage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/workmode" element={<WorkModePage />} />
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Routes>
    </Suspense>
  );
}; 
