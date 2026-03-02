import { format } from "date-fns";
import type { ActivityItem, KpiData, QuickAction, Task, PipelineStage } from "./dashboardTypes";

// Mock loading state toggle (set to true to see loading states)
export const MOCK_LOADING = false;
export const MOCK_LOADING_DURATION = 800; // ms

// Date goale – fiecare utilizator/workspace vede de la 0 (fără demo)
export const emptyKpiData: KpiData[] = [
  { label: "Total Lead-uri", value: 0, change: { value: 0, isPositive: true } },
  { label: "Tranzacții Active", value: 0, change: { value: 0, isPositive: true } },
  { label: "Vizionări Astăzi", value: 0, change: { value: 0, isPositive: true } },
  { label: "Venit (Luna Curentă)", value: "0 EUR", change: { value: 0, isPositive: true } },
];
export const emptyActivities: ActivityItem[] = [];
export const emptyTasks: Task[] = [];
export const emptyPipelineStages: PipelineStage[] = [
  { id: "leads", name: "Lead-uri", count: 0, color: "bg-gradient-to-r from-blue-500 to-cyan-500", percentage: 0 },
  { id: "qualified", name: "Calificate", count: 0, color: "bg-gradient-to-r from-purple-500 to-pink-500", percentage: 0 },
  { id: "viewings", name: "Vizionări", count: 0, color: "bg-gradient-to-r from-orange-500 to-amber-500", percentage: 0 },
  { id: "offers", name: "Oferte", count: 0, color: "bg-gradient-to-r from-green-500 to-emerald-500", percentage: 0 },
];

export const mockKpiData: KpiData[] = [
  {
    label: "Total Lead-uri",
    value: 142,
    change: {
      value: 12,
      isPositive: true,
    },
  },
  {
    label: "Tranzacții Active",
    value: 23,
    change: {
      value: 3,
      isPositive: true,
    },
  },
  {
    label: "Vizionări Astăzi",
    value: 5,
    change: {
      value: 0,
      isPositive: true,
    },
  },
  {
    label: "Venit (Luna Curentă)",
    value: "124.500 EUR",
    change: {
      value: 8.5,
      isPositive: true,
    },
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "lead",
    title: "Lead nou: Maria Popescu",
    description: "Interesată de apartament cu 3 camere în centru",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // acum 15 minute
    user: {
      name: "Ion Popescu",
    },
  },
  {
    id: "2",
    type: "deal",
    title: "Tranzacție actualizată: Strada Stejarului",
    description: "Ofertă acceptată, trecem la finalizare",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // acum 45 minute
    user: {
      name: "Ana Ionescu",
    },
  },
  {
    id: "3",
    type: "viewing",
    title: "Vizionare programată",
    description: "Strada Principală 123 - Mâine la 14:00",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // acum 2 ore
    user: {
      name: "Ion Popescu",
    },
  },
  {
    id: "4",
    type: "task",
    title: "Sarcină finalizată: Follow-up cu client",
    description: "Clientul a răspuns pozitiv",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // acum 3 ore
    user: {
      name: "Ion Popescu",
    },
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Sună Maria Popescu despre vizionare",
    description: "Follow-up pentru interesul în proprietate",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // peste 2 ore
    completed: false,
    priority: "high",
    relatedTo: {
      type: "lead",
      id: "lead_1",
      name: "Maria Popescu",
    },
  },
  {
    id: "2",
    title: "Pregătește documentele pentru Strada Stejarului",
    description: "Adună toate actele necesare",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // mâine
    completed: false,
    priority: "high",
    relatedTo: {
      type: "deal",
      id: "deal_1",
      name: "Strada Stejarului",
    },
  },
  {
    id: "3",
    title: "Programează sesiune foto pentru proprietate",
    description: "Strada Principală 123 necesită fotografii profesionale",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // peste 2 zile
    completed: false,
    priority: "medium",
    relatedTo: {
      type: "property",
      id: "prop_1",
      name: "Strada Principală 123",
    },
  },
  {
    id: "4",
    title: "Revizuiește raportul de analiză pieței",
    description: "Analiza tendințelor pieței Q1",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // ieri (restantă)
    completed: false,
    priority: "low",
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    id: "new-lead",
    label: "Lead Nou",
    href: "/leads/new",
  },
  {
    id: "new-property",
    label: "Adaugă Proprietate",
    href: "/properties/new",
  },
  {
    id: "create-task",
    label: "Creează Sarcină",
    href: "/tasks/new",
  },
  {
    id: "upload-document",
    label: "Încarcă Document",
    href: "/documents/new",
  },
];

export const mockPipelineStages: PipelineStage[] = [
  {
    id: "leads",
    name: "Lead-uri",
    count: 42,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    percentage: 30,
  },
  {
    id: "qualified",
    name: "Calificate",
    count: 28,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    percentage: 50,
  },
  {
    id: "viewings",
    name: "Vizionări",
    count: 15,
    color: "bg-gradient-to-r from-orange-500 to-amber-500",
    percentage: 70,
  },
  {
    id: "offers",
    name: "Oferte",
    count: 8,
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    percentage: 90,
  },
];
