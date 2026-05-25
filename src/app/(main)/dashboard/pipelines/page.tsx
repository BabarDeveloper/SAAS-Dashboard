"use client";

import type { DragEvent } from "react";
import { useEffect, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Phone,
  PipetteIcon,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
// framer-motion removed per request; using static rendering
import { Bar, BarChart, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// --- Constants ---
// External API integration removed per request — pipeline will use local demo data only

// --- Types ---
type LeadStage = string;

interface Lead {
  id: string;
  name: string;
  product: string;
  source: string;
  stage: LeadStage;
  timestamp: Date;
  salesperson?: string;
  value?: number;
  lastMovedAt?: Date;
}

interface ActivityEvent {
  id: string;
  leadId: string;
  message: string;
  timestamp: Date;
  type: "new_lead" | "stage_change" | "credit_app" | "sale";
}

interface Stage {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  warningThresholdMinutes?: number;
}

// --- Mock Data ---
const PRODUCTS = [
  "AI Content Studio",
  "Conversational Bot",
  "Growth Analytics",
  "Automated Lead Scoring",
  "Customer Success AI",
  "Intelligent Email Campaigns",
];
const SOURCES = ["Website", "LinkedIn", "Email", "Referral", "Organic Search", "Partner"];
const NAMES = ["John D.", "Sarah M.", "Mike T.", "Emily R.", "David L.", "Jessica W.", "Robert B.", "Amanda C."];
const SALESPEOPLE = ["Alex", "Jordan", "Taylor", "Morgan"];

const INITIAL_STAGES: Stage[] = [
  {
    id: "new",
    label: "New Leads",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    warningThresholdMinutes: 15,
  },
  {
    id: "contacted",
    label: "Contacted / Hot",
    icon: Phone,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    warningThresholdMinutes: 60,
  },
  {
    id: "credit_app",
    label: "Credit App",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    warningThresholdMinutes: 120,
  },
  {
    id: "test_drive",
    label: "Test Drive",
    icon: Car,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    warningThresholdMinutes: 120,
  },
  { id: "sold", label: "Sold", icon: CheckCircle, color: "bg-green-500/10 text-green-500 border-green-500/20" },
];

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- Main Component ---
const Index = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageThreshold, setNewStageThreshold] = useState("60");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [editStageThreshold, setEditStageThreshold] = useState("");

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "John Doe",
      product: "AI Content Studio",
      source: "Website",
      stage: "new",
      salesperson: "Taylor",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      lastMovedAt: new Date(Date.now() - 1000 * 40),
    },
    {
      id: "2",
      name: "Jane Smith",
      product: "Conversational Bot",
      source: "LinkedIn",
      stage: "contacted",
      salesperson: "Alex",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      lastMovedAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "3",
      name: "Mike Johnson",
      product: "Growth Analytics",
      source: "Email",
      stage: "credit_app",
      salesperson: "Jordan",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      lastMovedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "4",
      name: "Sarah Williams",
      product: "Automated Lead Scoring",
      source: "Referral",
      stage: "test_drive",
      salesperson: "Taylor",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      lastMovedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]);

  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: "a1",
      leadId: "1",
      message: "New lead received from Website",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "new_lead",
    },
    {
      id: "a2",
      leadId: "2",
      message: "Alex contacted Jane Smith",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "stage_change",
    },
  ]);

  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [salespersonFilter, setSalespersonFilter] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // API integration removed — always use local demo leads
  const displayLeads = leads;

  const filteredLeads = displayLeads.filter((lead) => {
    const matchSource = sourceFilter === "all" || lead.source === sourceFilter;
    if (salespersonFilter === "unassigned") return matchSource && !lead.salesperson;
    const matchSalesperson = salespersonFilter === "all" || lead.salesperson === salespersonFilter;
    return matchSource && matchSalesperson;
  });

  // --- Simulation Logic ---
  useEffect(() => {
    // Add new leads randomly
    const newLeadInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newLead: Lead = {
          id: generateId(),
          name: randomItem(NAMES),
          product: randomItem(PRODUCTS),
          source: randomItem(SOURCES),
          stage: "new",
          timestamp: new Date(),
          lastMovedAt: new Date(),
        };

        setLeads((prev) => [newLead, ...prev]);
        setActivities((prev) => {
          const newActivity: ActivityEvent = {
            id: generateId(),
            leadId: newLead.id,
            message: `New lead: ${newLead.name} interested in ${newLead.product} (${newLead.source})`,
            timestamp: new Date(),
            type: "new_lead",
          };
          return [newActivity, ...prev].slice(0, 20);
        });
      }
    }, 8000); // Check every 8 seconds

    // Move leads randomly
    const moveLeadInterval = setInterval(() => {
      setLeads((prevLeads) => {
        const movableLeads = prevLeads.filter((l) => l.stage !== "sold");
        if (movableLeads.length === 0 || Math.random() > 0.7) return prevLeads;

        const leadToMove = randomItem(movableLeads);
        const currentIndex = stages.findIndex((s) => s.id === leadToMove.stage);
        if (currentIndex === -1 || currentIndex >= stages.length - 1) return prevLeads;
        const nextStage = stages[currentIndex + 1].id;

        let activityMessage = "";
        let activityType: ActivityEvent["type"] = "stage_change";

        const salesperson = leadToMove.salesperson || randomItem(SALESPEOPLE);

        if (nextStage === "contacted") {
          activityMessage = `${salesperson} claimed and contacted ${leadToMove.name}`;
        } else if (nextStage === "credit_app") {
          activityMessage = `${leadToMove.name} submitted a credit application!`;
          activityType = "credit_app";
        } else if (nextStage === "test_drive") {
          activityMessage = `${leadToMove.name} scheduled a test drive with ${salesperson}`;
        } else if (nextStage === "sold") {
          activityMessage = `🎉 DEAL CLOSED! ${salesperson} closed ${leadToMove.product} for ${leadToMove.name}`;
          activityType = "sale";
        }

        setActivities((prev) => {
          const newActivity: ActivityEvent = {
            id: generateId(),
            leadId: leadToMove.id,
            message: activityMessage,
            timestamp: new Date(),
            type: activityType,
          };
          return [newActivity, ...prev].slice(0, 20);
        });

        return prevLeads.map((l) =>
          l.id === leadToMove.id
            ? {
                ...l,
                stage: nextStage,
                salesperson,
                value: nextStage === "sold" ? Math.floor(Math.random() * 20000) + 15000 : undefined,
                lastMovedAt: new Date(),
              }
            : l,
        );
      });
    }, 12000); // Check every 12 seconds

    return () => {
      clearInterval(newLeadInterval);
      clearInterval(moveLeadInterval);
    };
  }, [stages]);

  // --- Stats & Leaderboard Calculation ---
  const stats = {
    totalLeads: filteredLeads.length,
    soldToday: filteredLeads.filter((l) => l.stage === "sold").length,
    revenue: filteredLeads.filter((l) => l.stage === "sold").reduce((acc, l) => acc + (l.value || 0), 0),
    activeApps: filteredLeads.filter((l) => l.stage === "credit_app").length,
    untouched: displayLeads.filter((l) => l.stage === "new").length,
  };

  const leaderboard = SALESPEOPLE.map((sp) => {
    const spLeads = displayLeads.filter((l) => l.salesperson === sp && l.stage === "sold");
    const totalValue = spLeads.reduce((acc, l) => acc + (l.value || 0), 0);
    return { name: sp, deals: spLeads.length, value: totalValue };
  }).sort((a, b) => b.deals - a.deals || b.value - a.value);

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStageId = newStageName.toLowerCase().replace(/\s+/g, "_");
    const colors = [
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-teal-500/10 text-teal-500 border-teal-500/20",
      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setStages((prev) => {
      const newStages = [...prev];
      const soldIndex = newStages.findIndex((s) => s.id === "sold");
      const newStage: Stage = {
        id: newStageId,
        label: newStageName,
        icon: Activity,
        color: randomColor,
        warningThresholdMinutes: parseInt(newStageThreshold, 10) || 60,
      };
      if (soldIndex !== -1) {
        newStages.splice(soldIndex, 0, newStage);
      } else {
        newStages.push(newStage);
      }
      return newStages;
    });
    setNewStageName("");
    setNewStageThreshold("60");
    setIsAddStageOpen(false);
  };

  const handleEditStage = () => {
    if (!editingStage) return;
    setStages((prev) =>
      prev.map((s) =>
        s.id === editingStage.id ? { ...s, warningThresholdMinutes: parseInt(editStageThreshold, 10) || undefined } : s,
      ),
    );
    setEditingStage(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-border/40 border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-primary/30 bg-primary/20 p-2">
              <PipetteIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Pipeline Stages</h1>
              <p className="flex items-center gap-1 text-muted-foreground text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live Operations Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="mr-2 flex hidden items-center gap-2 rounded-full border border-border/50 bg-card/50 px-3 py-1.5 sm:flex">
              <Switch
                checked={isDemoMode}
                onCheckedChange={setIsDemoMode}
                id="demo-mode"
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="demo-mode" className="cursor-pointer font-medium text-xs">
                {isDemoMode ? "Demo Data" : "Live API"}
              </Label>
            </div>
            <Badge variant="outline" className="hidden bg-background/50 backdrop-blur sm:inline-flex">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">Total Leads Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.totalLeads}</div>
              <p className="mt-1 flex items-center text-primary text-xs">
                <ArrowUpRight className="mr-1 h-3 w-3" /> +12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-destructive/20 bg-destructive/10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-medium text-destructive text-sm">Untouched Leads</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="font-bold text-2xl text-destructive">{stats.untouched}</div>
              <p className="mt-1 text-destructive/80 text-xs">Awaiting first contact</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">Pending Credit Apps</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.activeApps}</div>
              <p className="mt-1 text-muted-foreground text-xs">Waiting for approval</p>
            </CardContent>
          </Card>
          {/* <Card className="bg-card/40 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Closed Deals</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stats.soldToday}</div>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" /> On track for goal
              </p>
            </CardContent>
          </Card> */}
          <Card className="relative overflow-hidden border-border/50 bg-card/40">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-medium text-primary text-sm">Est. Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="font-bold text-2xl">${stats.revenue.toLocaleString()}</div>
              <p className="mt-1 text-muted-foreground text-xs">Gross sales today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pipeline" className="flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <TabsList className="border border-border/50 bg-card/50">
              <TabsTrigger
                value="pipeline"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Activity className="mr-2 h-4 w-4" /> Pipeline
              </TabsTrigger>
              <TabsTrigger
                value="finance"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500"
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Finance & F&I
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500"
              >
                <BarChart3 className="mr-2 h-4 w-4" /> Manager Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="pipeline"
            className="mt-0 flex flex-1 flex-col border-none p-0 outline-none data-[state=inactive]:hidden"
          >
            <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Pipeline Board */}
              <div className="flex flex-col lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-lg">
                    <Activity className="h-5 w-5 text-primary" /> Active Pipeline
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="h-8 w-[140px] bg-card/50 text-xs">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
                      <SelectTrigger className="h-8 w-[140px] bg-card/50 text-xs">
                        <SelectValue placeholder="All Sales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sales</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {SALESPEOPLE.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsAddStageOpen(true)}>
                      <Plus className="mr-1 h-3 w-3" /> Add Stage
                    </Button>
                  </div>
                </div>

                <div className="custom-scrollbar flex flex-1 items-start gap-4 overflow-x-auto pb-4">
                  {stages.map((stage) => {
                    const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
                    return (
                      <div
                        key={stage.id}
                        className="flex min-h-[400px] min-w-[280px] max-w-[320px] flex-1 flex-col gap-3 rounded-xl border border-border/30 bg-card/20 p-3"
                      >
                        <div className={`flex items-center justify-between rounded-lg border p-2 ${stage.color}`}>
                          <div className="flex items-center gap-2">
                            <stage.icon className="h-4 w-4" />
                            <span className="font-semibold text-sm">{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {stage.id !== "sold" && (
                              <div className="flex items-center gap-0.5">
                                <span className="text-[10px] opacity-70" title="Warning Threshold">
                                  {stage.warningThresholdMinutes ? `>${stage.warningThresholdMinutes}m` : ""}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 hover:bg-background/20"
                                  onClick={() => {
                                    setEditingStage(stage);
                                    setEditStageThreshold(stage.warningThresholdMinutes?.toString() || "");
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <Badge variant="secondary" className="bg-background/50">
                              {stageLeads.length}
                            </Badge>
                          </div>
                        </div>

                        <ul
                          className="custom-scrollbar flex min-h-[100px] flex-1 flex-col gap-2 overflow-y-auto pr-1"
                          onDragOver={(e: DragEvent<HTMLUListElement>) => e.preventDefault()}
                          onDrop={(e: DragEvent<HTMLUListElement>) => {
                            e.preventDefault();
                            const leadId = e.dataTransfer.getData("leadId");
                            if (!leadId) return;

                            // Always perform local state update (no backend calls)
                            setLeads((prev) =>
                              prev.map((lead) => {
                                if (lead.id === leadId && lead.stage !== stage.id) {
                                  const salesperson = lead.salesperson || randomItem(SALESPEOPLE);
                                  let activityMessage = `Manually moved ${lead.name} to ${stage.label}`;
                                  let activityType: ActivityEvent["type"] = "stage_change";
                                  let value = lead.value;

                                  if (stage.id === "sold") {
                                    activityMessage = `🎉 DEAL CLOSED! ${salesperson} closed ${lead.product} for ${lead.name}`;
                                    activityType = "sale";
                                    value = value || Math.floor(Math.random() * 20000) + 15000;
                                  } else if (stage.id === "credit_app") {
                                    activityMessage = `${lead.name} submitted a credit application!`;
                                    activityType = "credit_app";
                                  }

                                  setActivities((prevAct) =>
                                    [
                                      {
                                        id: generateId(),
                                        leadId: lead.id,
                                        message: activityMessage,
                                        timestamp: new Date(),
                                        type: activityType,
                                      },
                                      ...prevAct,
                                    ].slice(0, 20),
                                  );

                                  return { ...lead, stage: stage.id, salesperson, value, lastMovedAt: new Date() };
                                }
                                return lead;
                              }),
                            );
                          }}
                        >
                          {stageLeads.map((lead) => {
                            const movedAt = lead.lastMovedAt || lead.timestamp;
                            const timeInStageMs = currentTime.getTime() - movedAt.getTime();

                            const thresholdMinutes = stage.warningThresholdMinutes || 1440; // Default 24h
                            // In demo mode: 1 minute = 1 second
                            const thresholdMs = isDemoMode ? thresholdMinutes * 1000 : thresholdMinutes * 60 * 1000;

                            const isStale = timeInStageMs > thresholdMs;

                            const seconds = Math.floor(timeInStageMs / 1000);
                            const minutes = Math.floor(seconds / 60);
                            const hours = Math.floor(minutes / 60);
                            const days = Math.floor(hours / 24);

                            let timeString = "";
                            if (days > 0) timeString = `${days}d`;
                            else if (hours > 0) timeString = `${hours}h`;
                            else if (minutes > 0) timeString = `${minutes}m`;
                            else timeString = `${seconds}s`;

                            return (
                              <li
                                key={lead.id}
                                draggable
                                onDragStart={(e: DragEvent<HTMLLIElement>) => {
                                  e.dataTransfer.setData("leadId", lead.id);
                                  (e.currentTarget as HTMLLIElement).style.opacity = "0.5";
                                }}
                                onDragEnd={(e: DragEvent<HTMLLIElement>) => {
                                  (e.currentTarget as HTMLLIElement).style.opacity = "1";
                                }}
                                className="relative cursor-grab active:cursor-grabbing"
                              >
                                {isStale && lead.stage !== "sold" && (
                                  <div className="absolute -top-1.5 -right-1.5 z-10">
                                    <span className="relative flex h-3 w-3">
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                                      <span className="relative inline-flex h-3 w-3 rounded-full border border-background bg-destructive" />
                                    </span>
                                  </div>
                                )}
                                <Card
                                  className={cn(
                                    "border-border/50 bg-card/60 transition-colors hover:bg-card",
                                    isStale &&
                                      lead.stage !== "sold" &&
                                      "border-destructive/50 shadow-[0_0_10px_rgba(220,38,38,0.15)]",
                                  )}
                                >
                                  <CardContent className="p-3">
                                    <div className="mb-2 flex items-start justify-between">
                                      <span className="truncate pr-2 font-medium text-sm">{lead.name}</span>
                                      <div className="flex items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground">
                                        <Clock
                                          className={cn(
                                            "h-3 w-3",
                                            isStale && lead.stage !== "sold" && "text-destructive",
                                          )}
                                        />
                                        <span
                                          className={cn(
                                            isStale && lead.stage !== "sold" && "font-medium text-destructive",
                                          )}
                                        >
                                          {timeString}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mb-2 line-clamp-1 text-muted-foreground text-xs">
                                      {lead.product}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                      <Badge variant="outline" className="h-4 bg-background/50 px-1.5 py-0 text-[10px]">
                                        {lead.source}
                                      </Badge>
                                      {lead.salesperson && (
                                        <div className="flex items-center gap-1">
                                          <Avatar className="h-4 w-4">
                                            <AvatarFallback className="bg-primary/20 text-[8px] text-primary">
                                              {lead.salesperson.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-[10px] text-muted-foreground">{lead.salesperson}</span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </li>
                            );
                          })}
                          {stageLeads.length === 0 && (
                            <div className="rounded-lg border-2 border-border/30 border-dashed py-8 text-center text-muted-foreground text-xs">
                              No leads in this stage
                            </div>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="flex flex-col gap-6">
                {/* Sales Leaderboard */}
                <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30">
                  <div className="border-border/50 border-b bg-card/50 p-4">
                    <h2 className="flex items-center gap-2 font-semibold text-sm">
                      <span className="text-lg text-yellow-500">🏆</span>
                      Sales Leaderboard
                    </h2>
                  </div>
                  <div className="space-y-4 p-4">
                    {leaderboard.map((sp, idx) => (
                      <div key={sp.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs",
                              idx === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : idx === 1
                                  ? "bg-slate-300/20 text-slate-300"
                                  : idx === 2
                                    ? "bg-amber-600/20 text-amber-600"
                                    : "bg-muted text-muted-foreground",
                            )}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-none">{sp.name}</p>
                            <p className="mt-1 text-muted-foreground text-xs">{sp.deals} deals</p>
                          </div>
                        </div>
                        <div className="font-semibold text-primary text-sm">${sp.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30">
                  <div className="border-border/50 border-b bg-card/50 p-4">
                    <h2 className="flex items-center gap-2 font-semibold text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                      Live Activity Feed
                    </h2>
                  </div>
                  <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-full p-1.5 ${
                            activity.type === "new_lead"
                              ? "bg-blue-500/20 text-blue-500"
                              : activity.type === "credit_app"
                                ? "bg-purple-500/20 text-purple-500"
                                : activity.type === "sale"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-orange-500/20 text-orange-500"
                          }`}
                        >
                          {activity.type === "new_lead" && <Clock className="h-3 w-3" />}
                          {activity.type === "credit_app" && <FileText className="h-3 w-3" />}
                          {activity.type === "sale" && <CheckCircle className="h-3 w-3" />}
                          {activity.type === "stage_change" && <Activity className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-foreground/90 text-sm leading-tight">{activity.message}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Finance & F&I Tab */}
          <TabsContent
            value="finance"
            className="mt-0 flex flex-1 flex-col border-none p-0 outline-none data-[state=inactive]:hidden"
          >
            <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Credit App Queue */}
              <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 lg:col-span-2">
                <div className="flex items-center justify-between border-border/50 border-b bg-card/50 p-4">
                  <h2 className="flex items-center gap-2 font-semibold text-sm">
                    <FileCheck className="h-5 w-5 text-purple-500" /> Credit App Queue
                  </h2>
                  <Badge variant="secondary" className="border-purple-500/20 bg-purple-500/10 text-purple-500">
                    {filteredLeads.filter((l) => l.stage === "credit_app").length} Pending
                  </Badge>
                </div>
                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                  {filteredLeads.filter((l) => l.stage === "credit_app").length === 0 ? (
                    <div className="rounded-lg border-2 border-border/30 border-dashed py-8 text-center text-muted-foreground text-xs">
                      No pending credit applications
                    </div>
                  ) : (
                    filteredLeads
                      .filter((l) => l.stage === "credit_app")
                      .map((lead) => (
                        <Card key={lead.id} className="border-border/50 bg-card/60">
                          <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <span className="font-semibold text-sm">{lead.name}</span>
                                <Badge variant="outline" className="h-5 bg-background/50 text-[10px]">
                                  {lead.product}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{" "}
                                  {new Date(lead.lastMovedAt || lead.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Rep: {lead.salesperson || "Unassigned"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-purple-500/30 text-purple-500 text-xs hover:bg-purple-500/10"
                              >
                                Review App
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-green-500/20 text-green-500 text-xs hover:bg-green-500/30"
                              >
                                Approve
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>

              {/* Document Checklists */}
              <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30">
                <div className="border-border/50 border-b bg-card/50 p-4">
                  <h2 className="flex items-center gap-2 font-semibold text-sm">
                    <CreditCard className="h-5 w-5 text-indigo-500" /> Pending Documents
                  </h2>
                </div>
                <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
                  {filteredLeads
                    .filter((l) => l.stage === "credit_app")
                    .slice(0, 3)
                    .map((lead) => (
                      <div key={`docs-${lead.id}`} className="space-y-2">
                        <div className="flex items-center justify-between font-medium text-sm">
                          <span>{lead.name}</span>
                          <span className="text-muted-foreground text-xs">1/3 Docs</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />{" "}
                            <span className="text-muted-foreground line-through">Driver's License</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <AlertCircle className="h-3 w-3 text-orange-500" /> <span>Proof of Income</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <AlertCircle className="h-3 w-3 text-orange-500" /> <span>Proof of Residence</span>
                          </div>
                        </div>
                        <div className="my-2 h-px bg-border/50" />
                      </div>
                    ))}
                  {filteredLeads.filter((l) => l.stage === "credit_app").length === 0 && (
                    <div className="py-4 text-center text-muted-foreground text-xs">No pending documents</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Manager Analytics Tab */}
          <TabsContent
            value="analytics"
            className="mt-0 flex flex-1 flex-col border-none p-0 outline-none data-[state=inactive]:hidden"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Conversion Rates */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 lg:col-span-2">
                <div className="border-border/50 border-b bg-card/50 p-4">
                  <h2 className="flex items-center gap-2 font-semibold text-sm">
                    <BarChart3 className="h-5 w-5 text-blue-500" /> Weekly Conversion Rates
                  </h2>
                </div>
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Mon", leads: 40, sales: 4 },
                        { name: "Tue", leads: 30, sales: 3 },
                        { name: "Wed", leads: 45, sales: 5 },
                        { name: "Thu", leads: 50, sales: 6 },
                        { name: "Fri", leads: 65, sales: 8 },
                        { name: "Sat", leads: 80, sales: 12 },
                        { name: "Sun", leads: 55, sales: 7 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      {/* Use dashboard primary blue for consistency */}
                      <Bar dataKey="leads" name="Total Leads" fill="rgba(59,130,246,0.18)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sales" name="Sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Routing Rules */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30">
                <div className="flex items-center justify-between border-border/50 border-b bg-card/50 p-4">
                  <h2 className="flex items-center gap-2 font-semibold text-sm">
                    <Settings className="h-5 w-5 text-muted-foreground" /> Lead Routing Rules
                  </h2>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium text-sm">Round Robin</Label>
                        <p className="text-[10px] text-muted-foreground">Distribute leads equally</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium text-sm">VIP Routing</Label>
                        <p className="text-[10px] text-muted-foreground">High value to senior reps</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium text-sm">After-hours Auto-reply</Label>
                        <p className="text-[10px] text-muted-foreground">Send SMS if after 7PM</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <div className="border-border/50 border-t pt-4">
                    <Button className="h-8 w-full text-xs" variant="outline">
                      Advanced Routing Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Stage</DialogTitle>
            <DialogDescription>Create a new stage for your pipeline.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Stage Name</Label>
              <Input
                id="name"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="e.g. Financing Approved"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStage();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Warning Threshold (minutes)</Label>
              <Input
                id="threshold"
                type="number"
                value={newStageThreshold}
                onChange={(e) => setNewStageThreshold(e.target.value)}
                placeholder="e.g. 60"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStage();
                  }
                }}
              />
              <p className="text-[10px] text-muted-foreground">In Demo Mode, 1 minute = 1 second</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddStage}>Add Stage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingStage} onOpenChange={(open) => !open && setEditingStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage: {editingStage?.label}</DialogTitle>
            <DialogDescription>Update the warning threshold for this stage.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-threshold">Warning Threshold (minutes)</Label>
              <Input
                id="edit-threshold"
                type="number"
                value={editStageThreshold}
                onChange={(e) => setEditStageThreshold(e.target.value)}
                placeholder="e.g. 60 (leave blank for default 24h)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditStage();
                  }
                }}
              />
              <p className="text-[10px] text-muted-foreground">
                In Demo Mode, 1 minute = 1 second. Leads in this stage longer than the threshold will turn red.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditStage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
        }
      `}</style>
    </div>
  );
};

export default Index;
