import React from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import { AuthProvider, useAuth } from "../shared/context/AuthContext";
import "./styles/index.css";
import { LogoUrl } from "../shared/assets";

const AppContent = () => {
  const { user, logout } = useAuth();

  const Nav = () => {
    const { pathname } = useLocation();
    const isActive = (path: string) => pathname === path;

    if (!user) return null;

    return (
      <nav className="flex flex-wrap gap-2 justify-center p-2">
        <Link
          to="/"
          className={`pill ${isActive("/") ? "pill-active" : "pill-muted"}`}
        >
          Home
        </Link>
        <Link
          to="/posture"
          className={`pill ${
            isActive("/posture") ? "pill-active" : "pill-muted"
          }`}
        >
          Posture
        </Link>
        <Link
          to="/vision"
          className={`pill ${
            isActive("/vision") ? "pill-active" : "pill-muted"
          }`}
        >
          Vision
        </Link>
        <Link
          to="/workmode"
          className={`pill ${
            isActive("/workmode") ? "pill-active" : "pill-muted"
          }`}
        >
          Work Mode
        </Link>
        <Link
          to="/profile"
          className={`pill ${
            isActive("/profile") ? "pill-active" : "pill-muted"
          }`}
        >
          Profile
        </Link>
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img
                src={LogoUrl}
                alt="Логотип"
                className="h-30 w-30 rounded-2xl shadow-glass"
              />
              <div>
                <div className="text-xl font-bold">Remote Worker Health</div>
                <div className="text-xs text-slate-500">
                  Posture, Vision, Work Mode
                </div>
              </div>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-blue-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <div className="sticky top-0 z-10 bg-gradient-to-b from-white/70 to-white/30 backdrop-blur border-t border-b border-white/60 shadow-soft">
          <div className="max-w-5xl mx-auto">
            <Nav />
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="grid gap-6">
            <div className="card p-0">
              <AppRoutes />
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Remote Worker Health
      </footer>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};
