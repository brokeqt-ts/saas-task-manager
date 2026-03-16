import { Header } from "@/components/layout/header";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";
import { MyTasksList } from "@/components/my-tasks/my-tasks-list";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const locale = await getLocale();

  return (
    <>
      <Header title={t(locale, "nav.myTasks")} />
      <main className="p-3 md:p-6">
        <MyTasksList />
      </main>
    </>
  );
}
