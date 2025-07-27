import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import "./styles/index.css";

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <header className="p-4 bg-blue-600 text-white text-center text-2xl font-bold shadow">
          Здоровье удаленщика
        </header>
        <nav className="flex flex-wrap gap-2 justify-center bg-white shadow p-2">
          <Link
            to="/"
            className="px-4 py-2 rounded bg-blue-500 text-white font-medium hover:bg-blue-700 transition"
          >
            Главная
          </Link>
          <Link
            to="/posture"
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
          >
            Осанка
          </Link>
          <Link
            to="/vision"
            className="px-4 py-2 rounded bg-green-100 text-green-700 font-medium hover:bg-green-200 transition"
          >
            Зрение
          </Link>
          <Link
            to="/workmode"
            className="px-4 py-2 rounded bg-yellow-100 text-yellow-700 font-medium hover:bg-yellow-200 transition"
          >
            Режим работы
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Настройки
          </Link>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
          <AppRoutes />
        </main>
        <footer className="p-2 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Здоровье удаленщика
        </footer>
      </div>
    </Router>
  );
};
