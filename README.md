# DevHealth - Remote Worker Health Application

Приложение для мониторинга здоровья удаленных работников с геймификацией и системой достижений.

## Возможности

- 🧍 **Мониторинг осанки** - анализ позы с помощью веб-камеры
- 👁️ **Напоминания о зрении** - правило 20-20-20 для защиты глаз
- ⏰ **Помодоро-таймер** - управление рабочим временем
- 🏆 **Геймификация** - достижения, уровни, опыт
- 📊 **Статистика здоровья** - отслеживание прогресса
- 🌍 **Мультиязычность** - поддержка русского и английского языков
- 🔐 **Аутентификация** - регистрация и вход пользователей

## Технологии

### Backend
- Node.js + Express
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT аутентификация

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Webpack
- TensorFlow.js для анализа позы

## Установка и запуск

### Предварительные требования
- Node.js 18+
- PostgreSQL
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd dev_health
```

### 2. Установка зависимостей
```bash
# Установка зависимостей для всех частей проекта
npm install
npm run install:backend
npm run install:frontend
```

### 3. Настройка базы данных
Создайте файл `.env` в папке `backend/`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dev_health
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=development
```

### 4. Инициализация базы данных
```bash
cd backend
npm run init-db
```

### 5. Запуск приложения
```bash
# Запуск backend и frontend одновременно
npm run dev

# Или по отдельности:
npm run dev:backend    # Backend на порту 3001
npm run dev:frontend   # Frontend на порту 8080
```

## Структура проекта

```
dev_health/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # API маршруты
│   │   ├── services/       # Бизнес-логика
│   │   └── config/         # Конфигурация
│   └── package.json
├── frontend/                # React приложение
│   ├── src/
│   │   ├── app/           # Основное приложение
│   │   ├── pages/         # Страницы
│   │   ├── features/      # Функциональные компоненты
│   │   ├── shared/        # Общие компоненты
│   │   └── widgets/       # Виджеты
│   └── package.json
└── package.json            # Корневой package.json
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя

### Геймификация
- `GET /api/gamification/achievements` - Все достижения
- `GET /api/gamification/user-achievements` - Достижения пользователя
- `GET /api/gamification/leaderboard` - Лидерборд

### Мониторинг
- `POST /api/posture` - События осанки
- `POST /api/blink` - События моргания

## Разработка

### Тестирование
```bash
# Frontend тесты
cd frontend
npm test

# Backend тесты
cd backend
npm test
```

### Сборка
```bash
# Сборка для продакшена
npm run build
```

## Лицензия

MIT License

## Поддержка

По вопросам и предложениям создавайте Issues в репозитории.
