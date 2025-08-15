# Настройка Email Уведомлений в DevHealth

## Обзор

DevHealth теперь поддерживает автоматические email уведомления для:
- Приветственные письма при регистрации
- Уведомления о новых достижениях
- Ежедневные напоминания о здоровье
- Еженедельные отчеты о прогрессе
- Массовые рассылки

## Настройка SMTP

### 1. Создание файла .env

Скопируйте `backend/env.example` в `backend/.env` и заполните SMTP настройки:

```bash
cp backend/env.example backend/.env
```

### 2. Настройка Gmail (рекомендуется для тестирования)

#### Шаг 1: Включить двухфакторную аутентификацию
1. Перейдите в [Настройки безопасности Google](https://myaccount.google.com/security)
2. Включите "Двухэтапную аутентификацию"

#### Шаг 2: Создать пароль приложения
1. В настройках безопасности найдите "Пароли приложений"
2. Выберите "Другое (пользовательское имя)"
3. Введите название (например, "DevHealth")
4. Скопируйте сгенерированный пароль

#### Шаг 3: Настроить .env файл
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=DevHealth <your-email@gmail.com>
```

### 3. Альтернативные SMTP сервисы

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Собственный SMTP сервер
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Тестирование

### 1. Запуск сервера
```bash
npm run dev:backend
```

### 2. Тестирование через интерфейс
1. Войдите в приложение
2. Перейдите в Профиль → Настройки
3. В разделе "Тестирование Email уведомлений" нажмите любую кнопку
4. Проверьте почту

### 3. Тестирование через API
```bash
# Тестовое письмо
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Приветственное письмо
curl -X POST http://localhost:3001/api/notifications/welcome \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Уведомление о достижении
curl -X POST http://localhost:3001/api/notifications/achievement \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"achievementName":"Тест","achievementDescription":"Описание"}'
```

## Шаблоны уведомлений

### Доступные шаблоны
- `welcome` - Приветственное письмо
- `achievement` - Уведомление о достижении
- `dailyReminder` - Ежедневное напоминание
- `weeklyReport` - Еженедельный отчет

### Просмотр шаблонов
```bash
curl -X GET http://localhost:3001/api/notifications/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Автоматические уведомления

### При регистрации
- Автоматически отправляется приветственное письмо
- Не прерывает процесс регистрации при ошибке

### При получении достижений
- Автоматически отправляется при разблокировке
- Включает название и описание достижения

## Массовые рассылки

### Отправка всем пользователям
```bash
curl -X POST http://localhost:3001/api/notifications/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateKey":"dailyReminder"}'
```

### С кастомными данными
```bash
curl -X POST http://localhost:3001/api/notifications/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateKey":"weeklyReport",
    "customData": {
      "healthScore": "150",
      "level": "3"
    }
  }'
```

## Безопасность

### Ограничения
- Все endpoints требуют аутентификации
- Массовые рассылки доступны только аутентифицированным пользователям
- В продакшене рекомендуется добавить проверку на роль администратора

### Логирование
- Все попытки отправки логируются
- Ошибки не прерывают основной функционал приложения
- Успешные отправки отмечаются в логах

## Устранение неполадок

### Ошибка "Authentication failed"
- Проверьте правильность SMTP_USER и SMTP_PASS
- Убедитесь, что включена двухфакторная аутентификация (для Gmail)
- Используйте пароль приложения, а не обычный пароль

### Ошибка "Connection timeout"
- Проверьте SMTP_HOST и SMTP_PORT
- Убедитесь, что порт не заблокирован файрволом
- Попробуйте другой SMTP сервис

### Письма не доходят
- Проверьте папку "Спам"
- Убедитесь, что SMTP_FROM настроен корректно
- Проверьте логи сервера на наличие ошибок

## Производительность

### Оптимизации
- Задержка 100ms между массовыми отправками
- Асинхронная отправка без блокировки основного потока
- Fallback на текстовую версию для HTML писем

### Мониторинг
- Отслеживание количества отправленных/неудачных писем
- Логирование времени отправки
- Статистика по типам уведомлений
