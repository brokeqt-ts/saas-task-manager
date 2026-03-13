# TaskFlow

**English** | [Русский](#taskflow-ru)

---

## TaskFlow

A SaaS task management platform with kanban board, project collaboration, deadline notifications, and analytics. Built with Next.js 14 App Router.

### Features

- **Authentication** — registration and login with email + password (JWT sessions)
- **Projects** — create projects, invite members by email, manage roles (Owner / Member)
- **Kanban board** — drag-and-drop tasks across columns: To Do, In Progress, Review, Done
- **Task details** — title, description, priority (Low / Medium / High / Urgent), assignee, deadline
- **Deadline notifications** — in-app notifications with sound alert when unread count increases
- **Analytics dashboard** — task status breakdown chart, overdue tasks list, summary stats cards
- **Language switcher** — EN / RU interface, persisted via cookie

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers + Server Components |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon cloud) |
| Auth | NextAuth.js v5 beta — Credentials provider |
| Drag & Drop | @hello-pangea/dnd |
| Charts | recharts |
| Data fetching | SWR (client), Prisma direct (server) |
| Icons | @heroicons/react |

### Local Setup

**Prerequisites:** Node.js 18+, PostgreSQL database (local or [Neon](https://neon.tech))

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/saas-task-manager.git
cd saas-task-manager

# 2. Install dependencies
npm install
```

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
AUTH_SECRET="your-random-secret-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"
```

Also create `.env` (used by Prisma CLI only):

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

```bash
# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deployment (Vercel + Neon)

1. Create a PostgreSQL database at [neon.tech](https://neon.tech) and copy the connection string
2. Push your code to GitHub
3. Import the repository in [vercel.com](https://vercel.com)
4. Add environment variables in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Your deployment URL, e.g. `https://your-app.vercel.app` |

5. Deploy — the build script (`prisma generate && next build`) runs automatically.

### Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login and registration pages
│   ├── (dashboard)/     # Dashboard, projects, kanban, settings
│   └── api/             # REST API route handlers
├── components/
│   ├── analytics/       # Stats cards, status chart, overdue list
│   ├── kanban/          # Board, column, task card, inline add
│   ├── layout/          # Sidebar, header, notification bell
│   ├── projects/        # Create project dialog
│   ├── providers/       # SessionProvider, SWRConfig, LanguageProvider
│   ├── tasks/           # Task detail panel
│   └── ui/              # Avatar, Badge
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── auth-utils.ts    # getCurrentUser() helper
│   ├── i18n.ts          # EN/RU translations
│   ├── get-locale.ts    # Server-side locale from cookie
│   └── prisma.ts        # Prisma singleton
└── types/               # TypeScript types
```

### License

MIT

---

---

# TaskFlow (RU)

[English](#taskflow) | **Русский**

---

SaaS-платформа для управления задачами с kanban-доской, совместной работой над проектами, уведомлениями о дедлайнах и аналитикой. Построена на Next.js 14 App Router.

### Возможности

- **Аутентификация** — регистрация и вход по email + пароль (JWT-сессии)
- **Проекты** — создание проектов, приглашение участников по email, управление ролями (Владелец / Участник)
- **Kanban-доска** — перетаскивание задач между колонками: К выполнению, В процессе, На проверке, Готово
- **Детали задачи** — название, описание, приоритет (Низкий / Средний / Высокий / Срочный), исполнитель, дедлайн
- **Уведомления о дедлайнах** — внутренние уведомления со звуком при появлении новых непрочитанных
- **Аналитика** — диаграмма статусов задач, список просроченных задач, сводные карточки статистики
- **Переключатель языка** — интерфейс EN / RU, выбор сохраняется в cookie

### Стек технологий

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers + Server Components |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| База данных | PostgreSQL (Neon cloud) |
| Авторизация | NextAuth.js v5 beta — Credentials provider |
| Drag & Drop | @hello-pangea/dnd |
| Графики | recharts |
| Загрузка данных | SWR (клиент), Prisma напрямую (сервер) |
| Иконки | @heroicons/react |

### Локальный запуск

**Требования:** Node.js 18+, база данных PostgreSQL (локальная или [Neon](https://neon.tech))

```bash
# 1. Клонировать репозиторий
git clone https://github.com/<your-username>/saas-task-manager.git
cd saas-task-manager

# 2. Установить зависимости
npm install
```

Создать `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
AUTH_SECRET="случайный-секрет-минимум-32-символа"
NEXTAUTH_URL="http://localhost:3000"
```

Также создать `.env` (используется только Prisma CLI):

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

```bash
# 3. Выполнить миграцию базы данных
npx prisma migrate dev --name init

# 4. Запустить сервер разработки
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

### Деплой (Vercel + Neon)

1. Создать базу данных PostgreSQL на [neon.tech](https://neon.tech) и скопировать строку подключения
2. Загрузить код на GitHub
3. Импортировать репозиторий на [vercel.com](https://vercel.com)
4. Добавить переменные окружения в настройках проекта Vercel:

| Переменная | Значение |
|-----------|---------|
| `DATABASE_URL` | Строка подключения Neon |
| `AUTH_SECRET` | Случайный секрет (`openssl rand -hex 32`) |
| `NEXTAUTH_URL` | URL деплоя, например `https://your-app.vercel.app` |

5. Задеплоить — скрипт сборки (`prisma generate && next build`) выполнится автоматически.

### Структура проекта

```
src/
├── app/
│   ├── (auth)/          # Страницы входа и регистрации
│   ├── (dashboard)/     # Дашборд, проекты, kanban, настройки
│   └── api/             # REST API route handlers
├── components/
│   ├── analytics/       # Карточки статистики, диаграмма, просроченные
│   ├── kanban/          # Доска, колонка, карточка задачи, быстрое добавление
│   ├── layout/          # Сайдбар, шапка, колокольчик уведомлений
│   ├── projects/        # Диалог создания проекта
│   ├── providers/       # SessionProvider, SWRConfig, LanguageProvider
│   ├── tasks/           # Панель деталей задачи
│   └── ui/              # Avatar, Badge
├── lib/
│   ├── auth.ts          # Конфигурация NextAuth
│   ├── auth-utils.ts    # Хелпер getCurrentUser()
│   ├── i18n.ts          # Переводы EN/RU
│   ├── get-locale.ts    # Серверное чтение локали из cookie
│   └── prisma.ts        # Prisma singleton
└── types/               # TypeScript типы
```

### Лицензия

MIT
