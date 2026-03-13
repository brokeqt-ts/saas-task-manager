export type Locale = "en" | "ru";

type Translations = Record<string, string>;

const en: Translations = {
  // Auth - Login
  "login.title": "Sign in to TaskFlow",
  "login.subtitle": "Manage tasks efficiently",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.submitting": "Signing in...",
  "login.error": "Invalid email or password",
  "login.noAccount": "No account?",
  "login.register": "Register",

  // Auth - Register
  "register.title": "Create Account",
  "register.subtitle": "TaskFlow — task management",
  "register.name": "Name",
  "register.namePlaceholder": "John Doe",
  "register.passwordHint": "Minimum 6 characters",
  "register.submit": "Create account",
  "register.submitting": "Creating account...",
  "register.error": "Registration error",
  "register.hasAccount": "Already have an account?",
  "register.login": "Sign in",

  // Navigation
  "nav.home": "Home",
  "nav.projects": "Projects",

  // Dashboard
  "dashboard.title": "Home",

  // Stats cards
  "stats.myTasks": "My Tasks",
  "stats.overdue": "Overdue",
  "stats.completedThisWeek": "Completed This Week",
  "stats.activeProjects": "Active Projects",

  // Status chart
  "chart.tasksByStatus": "Tasks by Status",

  // Overdue list
  "overdue.title": "Overdue Tasks",
  "overdue.empty": "No overdue tasks",

  // Task statuses
  "status.TODO": "To Do",
  "status.IN_PROGRESS": "In Progress",
  "status.REVIEW": "Review",
  "status.DONE": "Done",

  // Task priorities
  "priority.LOW": "Low",
  "priority.MEDIUM": "Medium",
  "priority.HIGH": "High",
  "priority.URGENT": "Urgent",

  // Kanban
  "task.add": "Add task",
  "task.namePlaceholder": "Task name...",
  "task.newTask": "New Task",
  "task.titleLabel": "Title",
  "task.createTask": "Create",
  "task.creating": "Creating...",
  "task.cancel": "Cancel",

  // Task detail panel
  "task.details": "Task Details",
  "task.description": "Description",
  "task.descriptionPlaceholder": "Add description...",
  "task.status": "Status",
  "task.priority": "Priority",
  "task.assignee": "Assignee",
  "task.unassigned": "Unassigned",
  "task.deadline": "Deadline (MSK)",
  "task.overdue": "— Overdue!",
  "task.saving": "Saving...",
  "task.deleteConfirm": "Delete task?",
  "task.createdBy": "Created by {name}",
  "task.modifiedAt": "Modified: {date}",

  // Project page
  "project.settings": "Settings",
  "project.tasksCount": "{count} tasks · {members} members",

  // Project settings
  "settings.members": "Project Members",
  "settings.memberEmail": "Member email",
  "settings.add": "Add",
  "settings.error": "Error",
  "settings.roles.OWNER": "Owner",
  "settings.roles.ADMIN": "Administrator",
  "settings.roles.MEMBER": "Member",

  // Create project
  "project.new": "New Project",
  "project.newTitle": "New Project",
  "project.name": "Project Name",
  "project.description": "Description (optional)",
  "project.cancel": "Cancel",
  "project.create": "Create",
  "project.creating": "Creating...",

  // Notifications
  "notifications.title": "Notifications",
  "notifications.new": "{count} new",
  "notifications.markAllRead": "Mark all as read",
  "notifications.empty": "No notifications",

  // Notification types
  "notif.DEADLINE_APPROACHING": "⏰ Deadline approaching",
  "notif.TASK_ASSIGNED": "📋 Task assigned",
  "notif.TASK_STATUS_CHANGED": "🔄 Status changed",

  // Sign out
  "signout": "Sign out",
};

const ru: Translations = {
  // Auth - Login
  "login.title": "Войти в TaskFlow",
  "login.subtitle": "Управляйте задачами эффективно",
  "login.password": "Пароль",
  "login.submit": "Войти",
  "login.submitting": "Входим...",
  "login.error": "Неверный email или пароль",
  "login.noAccount": "Нет аккаунта?",
  "login.register": "Зарегистрироваться",

  // Auth - Register
  "register.title": "Создать аккаунт",
  "register.subtitle": "TaskFlow — управление задачами",
  "register.name": "Имя",
  "register.namePlaceholder": "Иван Иванов",
  "register.passwordHint": "Минимум 6 символов",
  "register.submit": "Создать аккаунт",
  "register.submitting": "Регистрируем...",
  "register.error": "Ошибка регистрации",
  "register.hasAccount": "Уже есть аккаунт?",
  "register.login": "Войти",

  // Navigation
  "nav.home": "Главная",
  "nav.projects": "Проекты",

  // Dashboard
  "dashboard.title": "Главная",

  // Stats cards
  "stats.myTasks": "Мои задачи",
  "stats.overdue": "Просроченные",
  "stats.completedThisWeek": "Завершено за неделю",
  "stats.activeProjects": "Активных проектов",

  // Status chart
  "chart.tasksByStatus": "Задачи по статусам",

  // Overdue list
  "overdue.title": "Просроченные задачи",
  "overdue.empty": "Нет просроченных задач",

  // Task statuses
  "status.TODO": "К выполнению",
  "status.IN_PROGRESS": "В работе",
  "status.REVIEW": "На проверке",
  "status.DONE": "Готово",

  // Task priorities
  "priority.LOW": "Низкий",
  "priority.MEDIUM": "Средний",
  "priority.HIGH": "Высокий",
  "priority.URGENT": "Срочно",

  // Kanban
  "task.add": "Добавить задачу",
  "task.namePlaceholder": "Название задачи...",
  "task.newTask": "Новая задача",
  "task.titleLabel": "Название",
  "task.createTask": "Создать",
  "task.creating": "Создаём...",
  "task.cancel": "Отмена",

  // Task detail panel
  "task.details": "Детали задачи",
  "task.description": "Описание",
  "task.descriptionPlaceholder": "Добавьте описание...",
  "task.status": "Статус",
  "task.priority": "Приоритет",
  "task.assignee": "Исполнитель",
  "task.unassigned": "Не назначен",
  "task.deadline": "Дедлайн (МСК)",
  "task.overdue": "— Просрочено!",
  "task.saving": "Сохранение...",
  "task.deleteConfirm": "Удалить задачу?",
  "task.createdBy": "Создал {name}",
  "task.modifiedAt": "Изменено: {date}",

  // Project page
  "project.settings": "Настройки",
  "project.tasksCount": "{count} задач · {members} участников",

  // Project settings
  "settings.members": "Участники проекта",
  "settings.memberEmail": "Email участника",
  "settings.add": "Добавить",
  "settings.error": "Ошибка",
  "settings.roles.OWNER": "Владелец",
  "settings.roles.ADMIN": "Администратор",
  "settings.roles.MEMBER": "Участник",

  // Create project
  "project.new": "Новый проект",
  "project.newTitle": "Новый проект",
  "project.name": "Название проекта",
  "project.description": "Описание (необязательно)",
  "project.cancel": "Отмена",
  "project.create": "Создать",
  "project.creating": "Создаём...",

  // Notifications
  "notifications.title": "Уведомления",
  "notifications.new": "{count} новых",
  "notifications.markAllRead": "Прочитать все",
  "notifications.empty": "Нет уведомлений",

  // Notification types
  "notif.DEADLINE_APPROACHING": "⏰ Дедлайн приближается",
  "notif.TASK_ASSIGNED": "📋 Назначена задача",
  "notif.TASK_STATUS_CHANGED": "🔄 Статус изменён",

  // Sign out
  "signout": "Выйти",
};

const translations: Record<Locale, Translations> = { en, ru };

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  let str = translations[locale]?.[key] ?? translations.ru[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
