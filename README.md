# TaskFlow

**English** | [Русский](#taskflow-ru)

---

## TaskFlow

A SaaS task management platform with kanban board, project collaboration, deadline notifications, and analytics. Built with Next.js 14 App Router.

### Features

**Core (per assignment):**
- **Authentication** — registration and login with email + password (JWT sessions)
- **Projects** — create projects, invite members by email, manage roles (Owner / Member)
- **Kanban board** — drag-and-drop tasks across columns: To Do, In Progress, Review, Done
- **Task details** — title, description, priority (Low / Medium / High / Urgent), assignee, deadline
- **Deadline notifications** — in-app alerts when deadlines approach (24h and 2h before)
- **Analytics dashboard** — task status breakdown chart, overdue tasks list, summary stats cards

**Beyond the assignment:**
- **Bilingual interface (EN / RU)** — full interface translation with language switcher, persisted via cookie
- **Mobile-responsive design** — adaptive layout for phone and desktop: compact task cards, fullscreen modal for task creation, collapsible sidebar with hamburger menu
- **Sound notifications** — audio alert when new unread notifications appear
- **Real-time sync** — SWR revalidation on focus + 30s polling keeps data in sync across devices and tabs
- **Optimistic drag-and-drop** — UI updates instantly on drag, then syncs with server; reorder logic handles both cross-column moves and same-column reordering in a transaction
- **N+1 query prevention** — database indexes on hot paths (`projectId + status`, `deadline`, `userId`) and batched queries
- **Project management** — project deletion with confirmation, member removal (owner-only actions)

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
git clone https://github.com/brokeqt-ts/saas-task-manager.git
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
│   ├── kanban/          # Board, column, task card, add task modal
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

**Основное (по заданию):**
- **Аутентификация** — регистрация и вход по email + пароль (JWT-сессии)
- **Проекты** — создание проектов, приглашение участников по email, управление ролями (Владелец / Участник)
- **Kanban-доска** — перетаскивание задач между колонками: К выполнению, В процессе, На проверке, Готово
- **Детали задачи** — название, описание, приоритет (Низкий / Средний / Высокий / Срочный), исполнитель, дедлайн
- **Уведомления о дедлайнах** — оповещения при приближении дедлайна (за 24ч и за 2ч)
- **Аналитика** — диаграмма статусов задач, список просроченных задач, сводные карточки статистики

**Сверх задания:**
- **Двуязычный интерфейс (EN / RU)** — полный перевод интерфейса с переключателем языка, выбор сохраняется в cookie
- **Адаптивный дизайн** — отдельная раскладка для телефона и десктопа: компактные карточки задач, полноэкранная модалка создания задачи, сворачиваемый сайдбар с бургер-меню
- **Звуковые уведомления** — звуковой сигнал при появлении новых непрочитанных уведомлений
- **Синхронизация в реальном времени** — SWR-ревалидация при фокусе + опрос каждые 30с поддерживает данные актуальными между устройствами и вкладками
- **Оптимистичный drag-and-drop** — UI обновляется мгновенно при перетаскивании, затем синхронизируется с сервером; логика переупорядочивания обрабатывает перемещения между колонками и внутри колонки в транзакции
- **Оптимизация запросов** — индексы БД на горячих путях (`projectId + status`, `deadline`, `userId`) и батчинг запросов
- **Управление проектами** — удаление проектов с подтверждением, удаление участников (действия только для владельца)

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
git clone https://github.com/brokeqt-ts/saas-task-manager.git
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
│   ├── kanban/          # Доска, колонка, карточка задачи, модалка добавления
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
