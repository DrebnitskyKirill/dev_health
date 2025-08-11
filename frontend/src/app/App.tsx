import React from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import "./styles/index.css";
import { LogoUrl } from "../shared/assets";

export const App = () => {
  const Nav = () => {
    const { pathname } = useLocation();
    const isActive = (path: string) => pathname === path;
    return (
      <nav className="flex flex-wrap gap-2 justify-center p-2">
        <Link to="/" className={`pill ${isActive('/') ? 'pill-active' : 'pill-muted'}`}>Главная</Link>
        <Link to="/posture" className={`pill ${isActive('/posture') ? 'pill-active' : 'pill-muted'}`}>Осанка</Link>
        <Link to="/vision" className={`pill ${isActive('/vision') ? 'pill-active' : 'pill-muted'}`}>Зрение</Link>
        <Link to="/workmode" className={`pill ${isActive('/workmode') ? 'pill-active' : 'pill-muted'}`}>Режим работы</Link>
        <Link to="/settings" className={`pill ${isActive('/settings') ? 'pill-active' : 'pill-muted'}`}>Настройки</Link>
      </nav>
    );
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-5">
          <div className="max-w-5xl l-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LogoUrl} alt="Логотип" className="h-30 w-30 rounded-2xl shadow-glass" />
              <div>
                <div className="text-xl font-bold">Здоровье удаленщика</div>
                <div className="text-xs text-slate-500">Осанка, зрение, режим работы</div>
              </div>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-10 bg-gradient-to-b from-white/70 to-white/30 backdrop-blur border-t border-b border-white/60 shadow-soft">
          <div className="max-w-5xl mx-auto"><Nav /></div>
        </div>

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
          &copy; {new Date().getFullYear()} Здоровье удаленщика
        </footer>
      </div>
    </Router>
  );
};
