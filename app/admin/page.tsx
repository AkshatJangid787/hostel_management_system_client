"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, DoorOpen, CalendarOff, MessageSquareWarning, Loader2, TrendingUp, TrendingDown, Bell, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
  : 'https://hostel-management-system-nqgb.onrender.com/api';

import { useAdminStore } from "@/store/useAdminStore";

export default function AdminDashboard() {
  const { 
    statsData, 
    recentComplaints, 
    recentLeaves, 
    isLoading, 
    fetchAdminData 
  } = useAdminStore();

  useEffect(() => {
    fetchAdminData();
    const socket = io(socketUrl);
    socket.on('complaintUpdate', () => fetchAdminData(true));
    socket.on('leaveUpdate', () => fetchAdminData(true));
    socket.on('noticeUpdate', () => fetchAdminData(true));
    return () => {
      socket.disconnect();
    };
  }, [fetchAdminData]);

  if (isLoading && !statsData.totalStudents) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="animate-pulse font-medium">Synchronizing systems...</p>
      </div>
    );
  }

  const stats = [
    { 
      title: "Total Students", 
      value: statsData.totalStudents, 
      icon: Users, 
      color: "text-blue-600",
      description: "Active enrollments",
      trend: "+4.5%",
      isUp: true,
      href: "/admin/register"
    },
    { 
      title: "Total Rooms", 
      value: statsData.totalRooms, 
      icon: DoorOpen, 
      color: "text-green-600",
      description: "Inventory capacity",
      trend: "Optimal",
      isUp: true,
      href: "/admin/rooms"
    },
    { 
      title: "Pending Leaves", 
      value: statsData.pendingLeaves, 
      icon: CalendarOff, 
      color: "text-orange-600",
      description: "Action required",
      trend: "-2 vs last week",
      isUp: false,
      href: "/admin/leaves"
    },
    { 
      title: "Open Complaints", 
      value: statsData.openComplaints, 
      icon: MessageSquareWarning, 
      color: "text-red-600",
      description: "Critical issues",
      trend: "+1 unresolved",
      isUp: true,
      href: "/admin/complaints"
    },
  ];


  return (
    <div className="space-y-10 p-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Command Center
        </h1>
        <p className="text-muted-foreground text-lg">Central hub for hostel administration and oversight.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.title} href={s.href} className="block group">
            <Card className="relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-primary/10 bg-card/50 backdrop-blur-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="font-semibold text-xs uppercase tracking-wider group-hover:text-primary transition-colors">{s.title}</CardDescription>
                <div className={`${s.color.replace('text', 'bg').replace('600', '100')} p-2 rounded-lg group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                  <Badge variant={s.isUp && s.color.includes('red') ? "destructive" : "secondary"} className="text-[10px] h-5">
                    {s.trend}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{s.description}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${s.color.replace('text', 'from').replace('-600', '-500')} to-transparent opacity-30`} />
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Priority Requests</h2>
          <Link href="/admin/complaints">
            <Button variant="ghost" size="sm" className="font-bold text-primary flex gap-2">
              Manage All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/5 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Complaints</CardTitle>
                <CardDescription>Awaiting resolution</CardDescription>
              </div>
              <MessageSquareWarning className="h-5 w-5 text-red-500/50" />
            </CardHeader>
            <CardContent className="space-y-4">
               {recentComplaints.length === 0 ? (
                 <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg text-center">No pending complaints</p>
               ) : (
                 recentComplaints.map((c: any) => (
                   <div key={c._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10 transition-all group">
                      <div className="h-2 w-2 mt-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{c.student?.user?.email || "Unknown Student"}</p>
                      </div>
                   </div>
                 ))
               )}
            </CardContent>
          </Card>

          <Card className="border-primary/5 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Leave Requests</CardTitle>
                <CardDescription>Awaiting approval</CardDescription>
              </div>
              <CalendarOff className="h-5 w-5 text-orange-500/50" />
            </CardHeader>
            <CardContent className="space-y-4">
               {recentLeaves.length === 0 ? (
                 <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg text-center">No pending leaves</p>
               ) : (
                 recentLeaves.map((l: any) => (
                   <div key={l._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10 transition-all group">
                      <div className="h-2 w-2 mt-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{l.reason}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{l.student?.user?.email || "Unknown Student"}</p>
                      </div>
                   </div>
                 ))
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



