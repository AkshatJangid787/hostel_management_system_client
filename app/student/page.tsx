"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { DoorOpen, Megaphone, MessageSquareWarning, CalendarOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';

import { useStudentStore } from "@/store/useStudentStore";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const { 
    stats, 
    notices, 
    profileData, 
    isLoading, 
    hasProfile, 
    fetchDashboardData 
  } = useStudentStore();

  useEffect(() => {
    fetchDashboardData();

    const socket = io(socketUrl);

    socket.on('noticeUpdate', () => fetchDashboardData(true));
    socket.on('complaintUpdate', () => fetchDashboardData(true));
    socket.on('leaveUpdate', () => fetchDashboardData(true));

    return () => {
      socket.disconnect();
    };
  }, [fetchDashboardData]);

  if (isLoading && !profileData && notices.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const fullName = profileData?.firstName
    ? `${profileData.firstName} ${profileData.lastName || ''}`
    : user?.email?.split('@')[0] || "Student";

  return (
    <div className="space-y-10 p-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome back, {fullName.trim()}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 text-lg">
          Here is what's happening in your hostel today.
        </p>
      </div>

      {!hasProfile && (
        <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 shadow-none overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/40 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-800 dark:text-orange-300 text-lg">Profile Incomplete</h3>
                  <p className="text-orange-700/80 dark:text-orange-400/80">You need to complete your profile before you can access all features.</p>
                </div>
              </div>
              <Link href="/student/profile">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 group">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/student/room" className="group">
          <Card className="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="font-medium">My Room</CardDescription>
              <DoorOpen className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.roomNumber !== "Not Assigned" ? stats.roomNumber : "Assigning..."}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.roomNumber !== "Not Assigned" ? `Floor ${stats.block || '1'}` : "Check back later"}
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500 opacity-20" />
          </Card>
        </Link>

        <Link href="/student/fees" className="group">
          <Card className="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="font-medium">Pending Dues</CardDescription>
              <Megaphone className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.pendingDues}</div>
              <p className="text-xs text-muted-foreground mt-1">Current outstanding</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-green-500 opacity-20" />
          </Card>
        </Link>

        <Link href="/student/complaints" className="group">
          <Card className="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="font-medium">Active Complaints</CardDescription>
              <MessageSquareWarning className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">Issues being resolved</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500 opacity-20" />
          </Card>
        </Link>

        <Link href="/student/leaves" className="group">
          <Card className="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="font-medium">Approved Leaves</CardDescription>
              <CalendarOff className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approvedLeaves}</div>
              <p className="text-xs text-muted-foreground mt-1">Total approved historical</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500 opacity-20" />
          </Card>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold">Recent Notices</h2>
            <p className="text-sm text-muted-foreground mt-1">Stay updated with the latest hostel announcements.</p>
          </div>
          <Link href="/student/notices">
            <Button variant="outline" size="sm" className="hover:bg-primary/5">
              View Bulletin Board
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {notices.length === 0 ? (
            <div className="md:col-span-3 py-12 text-center bg-muted/30 rounded-xl border-2 border-dashed border-muted">
              <Megaphone className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">No recent announcements found.</p>
            </div>
          ) : (
            notices.slice(0, 3).map((n: any) => (
              <Card key={n._id || n.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/5 flex flex-col">
                <CardHeader className="pb-3 border-b border-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={n.type === 'IMPORTANT' ? "destructive" : "secondary"} className="text-[10px]">
                      {n.type || 'GENERAL'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-1">{n.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {n.content}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  <Link href={`/student/notices`} className="text-primary hover:underline flex items-center gap-1 font-medium">
                    Read More <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}