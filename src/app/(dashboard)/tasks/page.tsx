import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { taskFiltersSchema } from "@/lib/schemas/task";
import { buildTaskQuery } from "@/lib/tasks/query";
import { CreateTaskButton } from "@/components/tasks/CreateTaskButton";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskRow } from "@/components/tasks/TaskRow";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pickSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cleaned = Object.fromEntries(
    (["status", "priority", "window", "q"] as const)
      .map((k) => [k, pickSingle(sp[k])] as const)
      .filter(([, v]) => v && v !== ""),
  );

  const parsed = taskFiltersSchema.safeParse(cleaned);
  const filters = parsed.success ? parsed.data : {};
  const { where, orderBy } = buildTaskQuery(filters);

  const [tasks, allCount] = await Promise.all([
    prisma.task.findMany({ where, orderBy }),
    prisma.task.count(),
  ]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
  };

  const isFiltered = Object.keys(cleaned).length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Work
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Tasks</h1>
          <p className="text-sm text-slate-400">
            {isFiltered
              ? `Showing ${stats.total} of ${allCount} tasks matching your filters.`
              : `${allCount} tasks total · ${stats.pending} pending · ${stats.inProgress} in progress · ${stats.completed} completed.`}
          </p>
        </div>
        <CreateTaskButton />
      </header>

      <TaskFilters />

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-10 text-center">
          <p className="text-sm text-slate-300">
            {isFiltered ? "No tasks match these filters." : "No tasks yet."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isFiltered
              ? "Try clearing one of the filters above."
              : "Use “New task” to add your first one."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
