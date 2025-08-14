import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы для всех текстов приложения
const translations = {
  en: {
    // App
    'app.title': 'Remote Worker Health',
    'app.subtitle': 'Posture, Vision, Work Mode',
    
    // Navigation
    'nav.home': 'Home',
    'nav.posture': 'Posture',
    'nav.vision': 'Vision',
    'nav.workmode': 'Work Mode',
    'nav.profile': 'Profile',
    'nav.subscription': 'Subscription',
    'nav.settings': 'Settings',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Dashboard
    'dashboard.title': 'Health Dashboard',
    'dashboard.subtitle': 'Monitor your health habits and progress',
    'dashboard.healthScore': 'Health Score',
    'dashboard.level': 'Level',
    'dashboard.experience': 'Experience',
    'dashboard.badges': 'Badges',
    'dashboard.achievements': 'Achievements',
    'dashboard.leaderboard': 'Leaderboard',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.startPomodoro': 'Start Pomodoro',
    'dashboard.startVisionReminder': 'Start Vision Reminder',
    'dashboard.monitorPosture': 'Monitor Posture',
    'dashboard.hello': 'Hello',
    'dashboard.trackHealth': 'Track your computer health and compete with colleagues',
    'dashboard.healthPoints': 'Health Points',
    'dashboard.badgesEarned': 'Badges Earned',
    'dashboard.currentLevel': 'Current Level',
    'dashboard.growthPotential': 'Growth Potential',
    'dashboard.welcomeToDevHealth': 'Welcome to DevHealth!',
    'dashboard.signInToStart': 'Sign in to start tracking your health and compete with colleagues',
    'dashboard.signIn': 'Sign In',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.welcome': 'Welcome to DevHealth',
    'auth.subtitle': 'Track your health habits and improve productivity',
    'auth.createAccount': 'Create Account',
    'auth.signInToAccount': 'Sign In to Account',
    'auth.enterEmail': 'Enter email',
    'auth.enterPassword': 'Enter password',
    'auth.loading': 'Loading...',

    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.editProfile': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    'profile.oldPassword': 'Old Password',
    'profile.newPassword': 'New Password',
    'profile.updateProfile': 'Update Profile',
    'profile.profileUpdated': 'Profile updated successfully',
    'profile.passwordChanged': 'Password changed successfully',
    'profile.subtitle': 'Manage your account and preferences',
    'profile.profileSettings': 'Profile Settings',
    'profile.username': 'Username',
    'profile.edit': 'Edit',
    'profile.enterUsername': 'Enter new username',
    'profile.passwordSettings': 'Password Settings',
    'profile.passwordChangeNote': 'Leave password fields empty if you don\'t want to change your password.',
    'profile.currentPassword': 'Current Password',
    'profile.enterCurrentPassword': 'Enter current password (required for password change)',
    'profile.enterNewPassword': 'Enter new password (optional)',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.confirmNewPassword': 'Confirm new password',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.cancel': 'Cancel',

    // Subscription
    'subscription.title': 'Choose Your Health Plan',
    'subscription.subtitle': 'Unlock advanced features to take your health monitoring to the next level',
    'subscription.currentPlan': 'Current Plan',
    'subscription.cancelSubscription': 'Cancel Subscription',
    'subscription.subscribeNow': 'Subscribe Now',
    'subscription.features': 'Features',
    'subscription.limits': 'Limits',
    'subscription.notifications': 'Notifications',
    'subscription.dataRetention': 'Data Retention',
    'subscription.teamMembers': 'Team Members',
    'subscription.customGoals': 'Custom Goals',
    'subscription.payment.title': 'Subscription Payment',
    'subscription.payment.amount': 'Amount to pay',
    'subscription.payment.method': 'Payment method',
    'subscription.payment.pay': 'Pay',
    'subscription.payment.cancel': 'Cancel',
    'subscription.payment.development': 'Payment function in development',

    // Pomodoro
    'pomodoro.title': 'Pomodoro Timer',
    'pomodoro.subtitle': 'Work focused, take breaks, stay healthy',
    'pomodoro.whyImportant.title': 'Why is this important?',
    'pomodoro.whyImportant.subtitle': 'Regular breaks every 25 minutes help:',
    'pomodoro.whyImportant.focus': 'Maintain focus and productivity',
    'pomodoro.whyImportant.eyes': 'Reduce eye strain and muscle tension',
    'pomodoro.whyImportant.burnout': 'Prevent burnout and stress',
    'pomodoro.whyImportant.quality': 'Improve work quality',
    'pomodoro.work': 'Work',
    'pomodoro.break': 'Break',
    'pomodoro.longBreak': 'Long Break',
    'pomodoro.focusTask': 'Focus on the task',
    'pomodoro.restRelax': 'Rest and relax',
    'pomodoro.longerRest': 'Take a longer rest',
    'pomodoro.start': 'Start',
    'pomodoro.stop': 'Stop',
    'pomodoro.reset': 'Reset',
    'pomodoro.working': 'Working...',
    'pomodoro.sessionsCompleted': 'Sessions completed',
    'pomodoro.minutesWorked': 'Minutes worked',
    'pomodoro.nextLongBreak': 'Next long break in',
    'pomodoro.sessions': 'sessions',
    'pomodoro.earnPoints': 'Each completed session earns health points!',

    // Vision Reminder
    'vision.title': '20-20-20 Reminder',
    'vision.subtitle': 'Every 20 minutes — 20 seconds looking into the distance',
    'vision.whyImportant.title': 'Why is this important?',
    'vision.whyImportant.subtitle': 'The 20-20-20 rule protects your vision:',
    'vision.whyImportant.rule': 'Every 20 minutes, look at an object 20 feet (6 meters) away',
    'vision.whyImportant.duration': 'For 20 seconds',
    'vision.whyImportant.strain': 'This reduces eye strain and prevents myopia',
    'vision.whyImportant.computer': 'Especially important when working at a computer',
    'vision.start': 'Start',
    'vision.stop': 'Stop',
    'vision.reset': 'Reset',
    'vision.running': 'Running...',
    'vision.remindersShown': 'Reminders shown',
    'vision.earnPoints': 'Each reminder earns health points!',
    'vision.ruleDescription': '20-20-20 Rule: every 20 minutes of computer work, look at an object 20 feet (6 meters) away for 20 seconds',

    // Posture
    'posture.title': 'Posture Monitoring',
    'posture.whyImportant.title': 'Why is this important?',
    'posture.whyImportant.subtitle': 'Proper posture at the computer prevents:',
    'posture.whyImportant.pain': 'Neck, back, and shoulder pain',
    'posture.whyImportant.headaches': 'Headaches and fatigue',
    'posture.whyImportant.spine': 'Long-term spine problems',
    'posture.whyImportant.productivity': 'Decreased productivity',
    'posture.status': 'Status',
    'posture.quality': 'Quality',
    'posture.fps': 'FPS',
    'posture.neckAngle': 'Neck angle',
    'posture.startMonitoring': 'Start Monitoring',
    'posture.stopMonitoring': 'Stop Monitoring',
    'posture.cameraDescription': 'The camera is used locally for pose analysis. Only aggregated events without images are sent to the server.',
    'posture.monitoring': 'Monitoring...',

    // Work Mode
    'workmode.title': 'Work Mode',
    'workmode.subtitle': 'Optimize your work environment for productivity and health',
    'workmode.pomodoroTechnique': 'Pomodoro Technique',
    'workmode.pomodoroDescription': 'The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.',
    'workmode.benefits': 'Benefits:',
    'workmode.benefit1': 'Improved focus and concentration',
    'workmode.benefit2': 'Reduced mental fatigue',
    'workmode.benefit3': 'Better time management',
    'workmode.benefit4': 'Increased productivity',
    'workmode.proTips': 'Pro Tips:',
    'workmode.tip1': 'Use a dedicated timer app',
    'workmode.tip2': 'Eliminate distractions during work sessions',
    'workmode.tip3': 'Take breaks away from your computer',
    'workmode.tip4': 'Track your completed sessions',
    'workmode.scientificBackground': 'Scientific Background:',
    'workmode.science1': 'Research shows that the human brain can maintain high focus for about 20-25 minutes',
    'workmode.science2': 'Short breaks help prevent decision fatigue',
    'workmode.science3': 'Regular breaks improve overall cognitive performance',
    'workmode.metrics.productivity': 'Average productivity increase',
    'workmode.metrics.fatigue': 'Reduction in mental fatigue',
    'workmode.metrics.completion': 'Better task completion rate',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.languageDescription': 'Choose your preferred language for the application interface',
    'settings.notifications': 'Notifications',
    'settings.notificationsDescription': 'Configure how you want to receive notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.theme': 'Theme',
    'settings.themeDescription': 'Choose your preferred visual theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.auto': 'Auto',
    'settings.save': 'Save Settings',
    'settings.settingsSaved': 'Settings saved successfully',

    // Achievements
    'achievements.title': 'Achievements',
    'achievements.earned': 'Earned',
    'achievements.points': 'Points',
    'achievements.date': 'Date',
    'achievements.loading': 'Loading achievements...',
    'achievements.noAchievements': 'No achievements yet. Keep working on your health habits!',
    'achievements.yourProfile': 'Your Profile',
    'achievements.yourBadges': 'Your Badges',
    'achievements.earnedAchievements': 'Earned Achievements',

    // Leaderboard
    'leaderboard.title': 'Health Leaderboard',
    'leaderboard.rank': 'Rank',
    'leaderboard.user': 'User',
    'leaderboard.score': 'Score',
    'leaderboard.level': 'Level',
    'leaderboard.loading': 'Loading leaderboard...',

    // Payment Methods
    'payment.card': 'Bank Card',
    'payment.sbp': 'SBP (Fast Payment System)',
    'payment.yoomoney': 'YooMoney',
    'payment.yookassa': 'Bank Card (YooKassa)',
    'payment.crypto': 'Cryptocurrency',

    // Features
    'features.basicMonitoring': 'Basic Health Monitoring',
    'features.advancedAnalytics': 'Advanced Analytics',
    'features.integrations': 'Third-party Integrations',
    'features.gamification': 'Gamification & Achievements',
    'features.customNotifications': 'Custom Notifications',
    'features.dataExport': 'Data Export',
    'features.prioritySupport': 'Priority Support',
    'features.teamFeatures': 'Team Features',
    'features.aiInsights': 'AI Health Insights',
    'features.healthReports': 'Detailed Health Reports',
  },
  ru: {
    // App
    'app.title': 'Здоровье удаленного работника',
    'app.subtitle': 'Осанка, Зрение, Режим работы',
    
    // Navigation
    'nav.home': 'Главная',
    'nav.posture': 'Осанка',
    'nav.vision': 'Зрение',
    'nav.workmode': 'Режим работы',
    'nav.profile': 'Профиль',
    'nav.subscription': 'Подписка',
    'nav.settings': 'Настройки',

    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.confirm': 'Подтвердить',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.previous': 'Назад',
    'common.close': 'Закрыть',
    'common.yes': 'Да',
    'common.no': 'Нет',

    // Dashboard
    'dashboard.title': 'Панель здоровья',
    'dashboard.subtitle': 'Отслеживайте свои привычки здоровья и прогресс',
    'dashboard.healthScore': 'Здоровье',
    'dashboard.level': 'Уровень',
    'dashboard.experience': 'Опыт',
    'dashboard.badges': 'Значки',
    'dashboard.achievements': 'Достижения',
    'dashboard.leaderboard': 'Рейтинг',
    'dashboard.quickActions': 'Быстрые действия',
    'dashboard.startPomodoro': 'Запустить Помодоро',
    'dashboard.startVisionReminder': 'Запустить напоминание',
    'dashboard.monitorPosture': 'Мониторинг осанки',
    'dashboard.hello': 'Привет',
    'dashboard.trackHealth': 'Отслеживайте здоровье компьютера и соревнуйтесь с коллегами',
    'dashboard.healthPoints': 'Очки здоровья',
    'dashboard.badgesEarned': 'Полученные значки',
    'dashboard.currentLevel': 'Текущий уровень',
    'dashboard.growthPotential': 'Потенциал роста',
    'dashboard.welcomeToDevHealth': 'Добро пожаловать в DevHealth!',
    'dashboard.signInToStart': 'Войдите, чтобы начать отслеживать здоровье и соревноваться с коллегами',
    'dashboard.signIn': 'Войти',

    // Auth
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.logout': 'Выход',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.username': 'Имя пользователя',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.hasAccount': 'Уже есть аккаунт?',
    'auth.signIn': 'Войти',
    'auth.signUp': 'Зарегистрироваться',
    'auth.welcome': 'Добро пожаловать в DevHealth',
    'auth.subtitle': 'Отслеживайте привычки здоровья и улучшайте продуктивность',
    'auth.createAccount': 'Создать аккаунт',
    'auth.signInToAccount': 'Войти в аккаунт',
    'auth.enterEmail': 'Введите email',
    'auth.enterPassword': 'Введите пароль',
    'auth.loading': 'Загрузка...',

    // Profile
    'profile.title': 'Профиль',
    'profile.personalInfo': 'Личная информация',
    'profile.editProfile': 'Редактировать профиль',
    'profile.changePassword': 'Изменить пароль',
    'profile.oldPassword': 'Старый пароль',
    'profile.newPassword': 'Новый пароль',
    'profile.updateProfile': 'Обновить профиль',
    'profile.profileUpdated': 'Профиль обновлен успешно',
    'profile.passwordChanged': 'Пароль изменен успешно',
    'profile.subtitle': 'Управляйте своим аккаунтом и предпочтениями',
    'profile.profileSettings': 'Настройки профиля',
    'profile.username': 'Имя пользователя',
    'profile.edit': 'Редактировать',
    'profile.enterUsername': 'Введите новое имя пользователя',
    'profile.passwordSettings': 'Настройки пароля',
    'profile.passwordChangeNote': 'Оставьте поля пароля пустыми, если не хотите изменить пароль.',
    'profile.currentPassword': 'Текущий пароль',
    'profile.enterCurrentPassword': 'Введите текущий пароль (требуется для смены пароля)',
    'profile.enterNewPassword': 'Введите новый пароль (необязательно)',
    'profile.confirmPassword': 'Подтвердите новый пароль',
    'profile.confirmNewPassword': 'Подтвердите новый пароль',
    'profile.saveChanges': 'Сохранить изменения',
    'profile.saving': 'Сохранение...',
    'profile.cancel': 'Отмена',

    // Subscription
    'subscription.title': 'Выберите план здоровья',
    'subscription.subtitle': 'Откройте расширенные функции для улучшения мониторинга здоровья',
    'subscription.currentPlan': 'Текущий план',
    'subscription.cancelSubscription': 'Отменить подписку',
    'subscription.subscribeNow': 'Подписаться сейчас',
    'subscription.features': 'Функции',
    'subscription.limits': 'Ограничения',
    'subscription.notifications': 'Уведомления',
    'subscription.dataRetention': 'Хранение данных',
    'subscription.teamMembers': 'Участники команды',
    'subscription.customGoals': 'Пользовательские цели',
    'subscription.payment.title': 'Оплата подписки',
    'subscription.payment.amount': 'Сумма к оплате',
    'subscription.payment.method': 'Способ оплаты',
    'subscription.payment.pay': 'Оплатить',
    'subscription.payment.cancel': 'Отмена',
    'subscription.payment.development': 'Функция оплаты в разработке',

    // Pomodoro
    'pomodoro.title': 'Таймер Помодоро',
    'pomodoro.subtitle': 'Работайте сосредоточенно, делайте перерывы, оставайтесь здоровыми',
    'pomodoro.whyImportant.title': 'Почему это важно?',
    'pomodoro.whyImportant.subtitle': 'Регулярные перерывы каждые 25 минут помогают:',
    'pomodoro.whyImportant.focus': 'Поддерживать концентрацию и продуктивность',
    'pomodoro.whyImportant.eyes': 'Снижать усталость глаз и напряжение мышц',
    'pomodoro.whyImportant.burnout': 'Предотвращать выгорание и стресс',
    'pomodoro.whyImportant.quality': 'Улучшать качество работы',
    'pomodoro.work': 'Работа',
    'pomodoro.break': 'Перерыв',
    'pomodoro.longBreak': 'Длинный перерыв',
    'pomodoro.focusTask': 'Сосредоточьтесь на задаче',
    'pomodoro.restRelax': 'Отдыхайте и расслабляйтесь',
    'pomodoro.longerRest': 'Отдохните подольше',
    'pomodoro.start': 'Старт',
    'pomodoro.stop': 'Стоп',
    'pomodoro.reset': 'Сброс',
    'pomodoro.working': 'Работаю...',
    'pomodoro.sessionsCompleted': 'Завершенных сессий',
    'pomodoro.minutesWorked': 'Минут работы',
    'pomodoro.nextLongBreak': 'Следующий длинный перерыв через',
    'pomodoro.sessions': 'сессий',
    'pomodoro.earnPoints': 'Каждая завершенная сессия приносит очки здоровья!',

    // Vision Reminder
    'vision.title': 'Напоминание 20-20-20',
    'vision.subtitle': 'Каждые 20 минут — 20 секунд смотреть вдаль',
    'vision.whyImportant.title': 'Почему это важно?',
    'vision.whyImportant.subtitle': 'Правило 20-20-20 защищает ваше зрение:',
    'vision.whyImportant.rule': 'Каждые 20 минут смотрите на объект в 20 футах (6 метрах)',
    'vision.whyImportant.duration': 'В течение 20 секунд',
    'vision.whyImportant.strain': 'Это снижает напряжение глаз и предотвращает близорукость',
    'vision.whyImportant.computer': 'Особенно важно при работе за компьютером',
    'vision.start': 'Старт',
    'vision.stop': 'Стоп',
    'vision.reset': 'Сброс',
    'vision.running': 'Работает...',
    'vision.remindersShown': 'Показано напоминаний',
    'vision.earnPoints': 'Каждое напоминание приносит очки здоровья!',
    'vision.ruleDescription': 'Правило 20-20-20: каждые 20 минут работы за компьютером смотрите на объект в 20 футах (6 метрах) в течение 20 секунд',

    // Posture
    'posture.title': 'Мониторинг осанки',
    'posture.whyImportant.title': 'Почему это важно?',
    'posture.whyImportant.subtitle': 'Правильная осанка за компьютером предотвращает:',
    'posture.whyImportant.pain': 'Боли в шее, спине и плечах',
    'posture.whyImportant.headaches': 'Головные боли и усталость',
    'posture.whyImportant.spine': 'Долгосрочные проблемы с позвоночником',
    'posture.whyImportant.productivity': 'Снижение продуктивности',
    'posture.status': 'Статус',
    'posture.quality': 'Качество',
    'posture.fps': 'FPS',
    'posture.neckAngle': 'Угол шеи',
    'posture.startMonitoring': 'Начать мониторинг',
    'posture.stopMonitoring': 'Остановить мониторинг',
    'posture.cameraDescription': 'Камера используется локально для анализа позы. На сервер отправляются только агрегированные события без изображений.',
    'posture.monitoring': 'Мониторинг...',

    // Work Mode
    'workmode.title': 'Режим работы',
    'workmode.subtitle': 'Оптимизируйте рабочую среду для продуктивности и здоровья',
    'workmode.pomodoroTechnique': 'Техника Помодоро',
    'workmode.pomodoroDescription': 'Техника Помодоро — это метод управления временем, разработанный Франческо Чирилло в конце 1980-х годов. Он использует таймер для разделения работы на интервалы, традиционно по 25 минут, разделенные короткими перерывами.',
    'workmode.benefits': 'Преимущества:',
    'workmode.benefit1': 'Улучшенная концентрация и фокус',
    'workmode.benefit2': 'Снижение умственной усталости',
    'workmode.benefit3': 'Лучшее управление временем',
    'workmode.benefit4': 'Повышенная продуктивность',
    'workmode.proTips': 'Профессиональные советы:',
    'workmode.tip1': 'Используйте специальное приложение-таймер',
    'workmode.tip2': 'Устраните отвлекающие факторы во время рабочих сессий',
    'workmode.tip3': 'Делайте перерывы вдали от компьютера',
    'workmode.tip4': 'Отслеживайте завершенные сессии',
    'workmode.scientificBackground': 'Научная основа:',
    'workmode.science1': 'Исследования показывают, что человеческий мозг может поддерживать высокую концентрацию около 20-25 минут',
    'workmode.science2': 'Короткие перерывы помогают предотвратить усталость от принятия решений',
    'workmode.science3': 'Регулярные перерывы улучшают общую когнитивную производительность',
    'workmode.metrics.productivity': 'Средний прирост продуктивности',
    'workmode.metrics.fatigue': 'Снижение умственной усталости',
    'workmode.metrics.completion': 'Лучшая скорость выполнения задач',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.language': 'Язык',
    'settings.languageDescription': 'Выберите предпочитаемый язык для интерфейса приложения',
    'settings.notifications': 'Уведомления',
    'settings.notificationsDescription': 'Настройте, как вы хотите получать уведомления',
    'settings.emailNotifications': 'Email уведомления',
    'settings.pushNotifications': 'Push уведомления',
    'settings.theme': 'Тема',
    'settings.themeDescription': 'Выберите предпочитаемую визуальную тему',
    'settings.light': 'Светлая',
    'settings.dark': 'Темная',
    'settings.auto': 'Авто',
    'settings.save': 'Сохранить настройки',
    'settings.settingsSaved': 'Настройки сохранены успешно',
 
    // Achievements
    'achievements.title': 'Достижения',
    'achievements.earned': 'Получено',
    'achievements.points': 'Очки',
    'achievements.date': 'Дата',
    'achievements.loading': 'Загрузка достижений...',
    'achievements.noAchievements': 'Пока нет достижений. Продолжайте работать над привычками здоровья!',
    'achievements.yourProfile': 'Ваш профиль',
    'achievements.yourBadges': 'Ваши значки',
    'achievements.earnedAchievements': 'Полученные достижения',

    // Leaderboard
    'leaderboard.title': 'Рейтинг здоровья',
    'leaderboard.rank': 'Ранг',
    'leaderboard.user': 'Пользователь',
    'leaderboard.score': 'Счет',
    'leaderboard.level': 'Уровень',
    'leaderboard.loading': 'Загрузка рейтинга...',

    // Payment Methods
    'payment.card': 'Банковская карта',
    'payment.sbp': 'СБП (Система быстрых платежей)',
    'payment.yoomoney': 'ЮMoney',
    'payment.yookassa': 'Банковская карта (ЮKassa)',
    'payment.crypto': 'Криптовалюта',

    // Features
    'features.basicMonitoring': 'Базовый мониторинг здоровья',
    'features.advancedAnalytics': 'Расширенная аналитика',
    'features.integrations': 'Сторонние интеграции',
    'features.gamification': 'Геймификация и достижения',
    'features.customNotifications': 'Пользовательские уведомления',
    'features.dataExport': 'Экспорт данных',
    'features.prioritySupport': 'Приоритетная поддержка',
    'features.teamFeatures': 'Командные функции',
    'features.aiInsights': 'AI инсайты здоровья',
    'features.healthReports': 'Детальные отчеты здоровья',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
