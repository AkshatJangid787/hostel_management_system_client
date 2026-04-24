"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BellIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { useStudentStore } from "@/store/useStudentStore";

export default function StudentNoticesPage() {
  const { notices, isLoading, fetchDashboardData } = useStudentStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
        <p className="text-muted-foreground">Stay updated with the latest announcements from the hostel administration.</p>
      </div>

      {notices.length === 0 ? (
        <div className="flex justify-center items-center h-[40vh] border rounded-lg border-dashed">
          <div className="text-center text-muted-foreground flex flex-col items-center">
            <BellIcon className="h-10 w-10 mb-4 opacity-50" />
            <p>No notices available right now.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice: any) => (
            <Card key={notice._id || notice.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-start gap-4">
                  <span>{notice.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 pt-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {notice.createdAt ? format(new Date(notice.createdAt), "PPP") : "Recent"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {notice.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
