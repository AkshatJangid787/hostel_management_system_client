"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2Icon, UserIcon } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/complaints/all");
      setComplaints(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch complaints");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      toast.success(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredComplaints = complaints.filter((c: any) => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold">Complaints</h1>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Complaints</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
         </Select>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 flex justify-center items-center"><Loader2Icon className="animate-spin text-muted-foreground mr-2 h-6 w-6" /> Loading complaints...</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((c: any) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-zinc-200">
                        <AvatarImage src={c.student?.profilePhoto} />
                        <AvatarFallback className="bg-zinc-100"><UserIcon className="h-5 w-5 text-zinc-400" /></AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                       <div className="font-medium">{c.student?.firstName ? `${c.student.firstName} ${c.student.lastName}` : 'Unknown'}</div>
                       <div className="text-xs text-muted-foreground">{c.student?.user?.email || "—"}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{c.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{c.description}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "RESOLVED" ? "default" : c.status === "IN_PROGRESS" ? "secondary" : "destructive"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setSelectedStudent(c.student); setDetailsOpen(true); }}
                        >
                          View Student
                        </Button>
                        {c.status !== "RESOLVED" && (
                          <>
                            {c.status === 'PENDING' && (
                              <Button size="sm" variant="secondary" onClick={() => updateStatus(c._id, 'IN_PROGRESS')}>In-Progress</Button>
                            )}
                            <Button size="sm" onClick={() => updateStatus(c._id, 'RESOLVED')}>Resolve</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredComplaints.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No complaints match this filter.</TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent ? (
            <div className="space-y-4 pt-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 border border-zinc-200">
                  <AvatarImage src={selectedStudent.profilePhoto} />
                  <AvatarFallback className="bg-zinc-100"><UserIcon className="h-12 w-12 text-zinc-400" /></AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">System Email</span>
                  <p className="font-medium text-zinc-900">{selectedStudent.user?.email || "—"}</p>
                </div>
                <div>
                   <span className="text-sm font-medium text-muted-foreground">Room</span>
                   <p className="font-medium text-zinc-900">{selectedStudent.room?.roomNumber || "Unassigned"}</p>
                </div>
                {selectedStudent.firstName && (
                  <>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                        <p className="font-medium text-zinc-900">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Enrollment No</span>
                        <p className="font-medium text-zinc-900">{selectedStudent.enrollmentNo || "—"}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Contact Number</span>
                        <p className="font-medium text-zinc-900">{selectedStudent.contactNumber || "—"}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Parent Contact</span>
                        <p className="font-medium text-zinc-900">{selectedStudent.parentContact || "—"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">This user has not established a profile yet.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
