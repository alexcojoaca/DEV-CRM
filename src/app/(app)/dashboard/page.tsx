"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isPast, isToday, isFuture } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { SectionCard } from "@/components/common/SectionCard";
import { PipelineSnapshot } from "@/components/common/PipelineSnapshot";
import { ActivityItem } from "@/components/common/ActivityItem";
import { TaskListItem } from "@/components/common/TaskListItem";
import { QuickActionTile } from "@/components/common/QuickActionTile";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonKpiCard, SkeletonTaskItem, SkeletonActivityItem } from "@/components/common/SkeletonBlock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  emptyKpiData,
  emptyActivities,
  emptyTasks,
  mockQuickActions,
  emptyPipelineStages,
  MOCK_LOADING,
  MOCK_LOADING_DURATION,
} from "@/features/dashboard/dashboardMockData";
import { useSession } from "@/features/session/useSession";
import { Plus, MoreVertical, UserPlus, Home, CheckSquare, FileText, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(MOCK_LOADING);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Simulate loading state
  useEffect(() => {
    if (MOCK_LOADING) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, MOCK_LOADING_DURATION);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const tasksWithCompletion = emptyTasks.map((task) => ({
    ...task,
    completed: completedTasks.has(task.id) || task.completed,
  }));

  const overdueTasks = tasksWithCompletion.filter((task) => !task.completed && isPast(task.dueDate) && !isToday(task.dueDate));
  const todayTasks = tasksWithCompletion.filter((task) => !task.completed && isToday(task.dueDate));
  const upcomingTasks = tasksWithCompletion.filter((task) => !task.completed && isFuture(task.dueDate) && !isToday(task.dueDate));

  const quickActionIcons = {
    "new-lead": UserPlus,
    "new-property": Home,
    "create-task": CheckSquare,
    "upload-document": FileText,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Bun venit! Iată ce se întâmplă cu afacerea ta astăzi."
        action={
          <div className="flex items-center gap-2">
            {/* Mobile: Show dropdown */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-purple-200 hover:bg-purple-50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/leads/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Lead Nou
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/viewings/new">
                      <Calendar className="mr-2 h-4 w-4" />
                      Programează Vizionare
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Desktop: Show buttons */}
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 border-purple-200" asChild>
                <Link href="/viewings/new">
                  <Calendar className="mr-2 h-4 w-4" />
                  Programează Vizionare
                </Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30" asChild>
                <Link href="/leads/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Lead Nou
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-purple-200 hover:bg-purple-50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/properties/new">Adaugă Proprietate</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tasks/new">Creează Sarcină</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      />

      {/* KPI Cards */}
      <section>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonKpiCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emptyKpiData.map((kpi, index) => (
              <KpiCard key={index} {...kpi} />
            ))}
          </div>
        )}
      </section>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: Pipeline + Activity */}
        <div className="space-y-6">
          {/* Pipeline Snapshot */}
          <SectionCard
            title="Rezumat Pipeline"
            description="Vedere de ansamblu asupra pipeline-ului de tranzacții"
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <PipelineSnapshot stages={emptyPipelineStages} />
            )}
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard
            title="Activitate Recentă"
            description="Ultimele actualizări de la echipa ta"
            action={
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50" asChild>
                <Link href="/activity">Vezi tot</Link>
              </Button>
            }
          >
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonActivityItem key={i} />
                ))}
              </div>
            ) : emptyActivities.length > 0 ? (
              <div className="space-y-2">
                {emptyActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Fără activitate recentă"
                description="Activitatea va apărea aici pe măsură ce echipa ta lucrează."
              />
            )}
          </SectionCard>
        </div>

        {/* Right Column: Tasks + Quick Actions */}
        <div className="space-y-6">
          {/* Tasks */}
          <SectionCard
            title="Sarcini"
            description="Sarcinile tale viitoare"
            action={
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50" asChild>
                <Link href="/tasks">Vezi tot</Link>
              </Button>
            }
          >
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <SkeletonTaskItem key={i} />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-purple-50/50">
                  <TabsTrigger value="today" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    Astăzi ({todayTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                    Restante ({overdueTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                    Viitoare ({upcomingTasks.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-4 space-y-2">
                  {todayTasks.length > 0 ? (
                    todayTasks.map((task) => (
                      <TaskListItem key={task.id} task={task} onToggle={handleTaskToggle} />
                    ))
                  ) : (
                    <EmptyState
                      title="Fără sarcini astăzi"
                      description="Ești la zi! Nu ai sarcini pentru astăzi."
                      className="py-8"
                    />
                  )}
                </TabsContent>
                <TabsContent value="overdue" className="mt-4 space-y-2">
                  {overdueTasks.length > 0 ? (
                    overdueTasks.map((task) => (
                      <TaskListItem key={task.id} task={task} onToggle={handleTaskToggle} />
                    ))
                  ) : (
                    <EmptyState
                      title="Fără sarcini restante"
                      description="Excelent! Ai gestionat toate sarcinile la timp."
                      className="py-8"
                    />
                  )}
                </TabsContent>
                <TabsContent value="upcoming" className="mt-4 space-y-2">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => (
                      <TaskListItem key={task.id} task={task} onToggle={handleTaskToggle} />
                    ))
                  ) : (
                    <EmptyState
                      title="Fără sarcini viitoare"
                      description="Toate sarcinile sunt programate pentru astăzi sau sunt restante."
                      className="py-8"
                    />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Acțiuni Rapide" description="Acțiuni comune">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mockQuickActions.map((action) => {
                  const Icon = quickActionIcons[action.id as keyof typeof quickActionIcons];
                  return (
                    <QuickActionTile
                      key={action.id}
                      label={action.label}
                      href={action.href}
                      icon={Icon && <Icon className="h-6 w-6" />}
                      variant="outline"
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
