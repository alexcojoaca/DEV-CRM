"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskForm } from "@/components/tasks/TaskForm";
import { EmptyState } from "@/components/common/EmptyState";
import type { Task, TaskFormData } from "@/features/tasks/taskTypes";
import { TASK_PRIORITY_OPTIONS, taskFromApi } from "@/features/tasks/taskTypes";
import { Plus, Search, ArrowLeft, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPast, isToday, startOfDay, endOfDay } from "date-fns";
import { useSession } from "@/features/session/useSession";

type ViewMode = "list" | "detail" | "add";
type DateFilter = "all" | "today" | "overdue" | "upcoming" | "done";

const defaultFormData: TaskFormData = {
  title: "",
  description: undefined,
  dueDate: new Date(),
  completed: false,
  priority: "medium",
  relatedTo: undefined,
};

function filterByDateFilter(tasks: Task[], filter: DateFilter): Task[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  switch (filter) {
    case "done":
      return tasks.filter((t) => t.completed);
    case "today":
      return tasks.filter(
        (t) => !t.completed && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= todayEnd
      );
    case "overdue":
      return tasks.filter((t) => !t.completed && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
    case "upcoming":
      return tasks.filter((t) => !t.completed && new Date(t.dueDate) > todayEnd);
    default:
      return tasks.filter((t) => !t.completed);
  }
}

export default function TasksPage() {
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filtered, setFiltered] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [addFormData, setAddFormData] = useState<TaskFormData>(defaultFormData);

  useEffect(() => {
    if (!workspaceId) {
      setTasks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tasks", { credentials: "include" });
        if (!res.ok) {
          setTasks([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setTasks((data as any[]).map((t) => taskFromApi(t)));
        }
      } catch {
        if (!cancelled) setTasks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    let list = filterByDateFilter(tasks, dateFilter);
    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.relatedTo?.name && t.relatedTo.name.toLowerCase().includes(q))
      );
    }
    setFiltered(list);
  }, [tasks, search, dateFilter, priorityFilter]);

  const selectedTask = selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null;

  const handleSelectTask = (task: Task) => {
    setSelectedId(task.id);
    setViewMode("detail");
  };

  const handleAddNew = () => {
    setAddFormData({
      ...defaultFormData,
      dueDate: new Date(),
    });
    setSelectedId(null);
    setViewMode("add");
  };

  const handleSaveNew = () => {
    if (!workspaceId) return;
    void (async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addFormData),
      });
      if (!res.ok) return;
      const created = taskFromApi(await res.json());
      setTasks((prev) => [...prev, created]);
      setViewMode("list");
      setSelectedId(null);
    })();
  };

  const handleUpdate = (id: string, data: TaskFormData) => {
    if (!workspaceId) return;
    void (async () => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      const updated = taskFromApi(await res.json());
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    })();
  };

  const handleToggle = (id: string) => {
    if (!workspaceId) return;
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    void (async () => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !current.completed }),
      });
      if (!res.ok) return;
      const updated = taskFromApi(await res.json());
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    })();
  };

  const handleDelete = (id: string) => {
    if (confirm("Ștergi această sarcină?")) {
      if (!workspaceId) return;
      void (async () => {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setViewMode("list");
        setSelectedId(null);
      })();
    }
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedId(null);
  };

  const showList = viewMode === "list";
  const showDetail = viewMode === "detail" && selectedTask;
  const showAdd = viewMode === "add";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sarcini"
        subtitle="Gestionează sarcinile și termenele tale. Filtrează după astăzi, restante sau finalizate."
        action={
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adaugă sarcină
          </Button>
        }
      />
      <div className="-m-4 flex h-panel-mobile-safe min-h-[480px] overflow-hidden rounded-xl border-2 border-purple-200/50 bg-white shadow-lg bg-gradient-to-br from-white via-purple-50/10 to-pink-50/10">
      <div
        className={cn(
          "flex w-full flex-col border-r border-purple-100 bg-gradient-to-b from-white to-purple-50/20 lg:w-[380px] lg:flex-shrink-0",
          "lg:block",
          !showList && "hidden"
        )}
      >
        <div className="flex shrink-0 flex-col gap-2 border-b border-purple-100 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Caută sarcini..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-purple-200 pl-9"
              />
            </div>
            <Button
              type="button"
              size="icon"
              onClick={handleAddNew}
              className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:from-purple-700 hover:to-pink-700"
              aria-label="Adaugă sarcină"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="border-purple-200 text-xs">
                <SelectValue placeholder="Perioada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate (deschise)</SelectItem>
                <SelectItem value="today">Astăzi</SelectItem>
                <SelectItem value="overdue">Restante</SelectItem>
                <SelectItem value="upcoming">Viitoare</SelectItem>
                <SelectItem value="done">Finalizate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-purple-200 text-xs">
                <SelectValue placeholder="Prioritate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {TASK_PRIORITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="h-12 w-12 text-purple-300" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {tasks.length === 0
                  ? "Niciună sarcină. Adaugă prima."
                  : "Niciun rezultat."}
              </p>
              {tasks.length === 0 && (
                <Button
                  type="button"
                  onClick={handleAddNew}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă sarcină
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  isActive={selectedId === task.id}
                  onToggle={handleToggle}
                  onClick={() => handleSelectTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          "absolute inset-0 z-10 bg-white lg:relative lg:z-0",
          showList && !showDetail && !showAdd && "hidden lg:flex lg:items-center lg:justify-center"
        )}
      >
        {showDetail && selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onUpdate={handleUpdate}
            onToggleCompleted={handleToggle}
            onBack={handleBack}
            onDelete={handleDelete}
          />
        )}
        {showAdd && (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center gap-3 border-b border-purple-100 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="lg:hidden"
                aria-label="Înapoi la listă"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-bold text-foreground">Sarcină nouă</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TaskForm
                data={addFormData}
                onChange={setAddFormData}
                onSubmit={handleSaveNew}
                onCancel={handleBack}
                submitLabel="Adaugă sarcină"
              />
            </div>
          </div>
        )}
        {showList && !showDetail && !showAdd && (
          <div className="hidden lg:flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="Selectează o sarcină"
              description="Alege o sarcină din listă sau adaugă una nouă."
              icon={<CheckSquare className="h-14 w-14 text-purple-400" />}
              action={{
                label: "Adaugă sarcină",
                onClick: handleAddNew,
              }}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
