"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2Icon, UserIcon } from "lucide-react";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/leaves/all");
      setLeaves(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch leaves");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave request ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredLeaves = leaves.filter((l: any) => {
    if (statusFilter === "ALL") return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold">Leave Requests</h1>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
         </Select>
      </div>
      {isLoading ? (
        <Card><CardContent className="py-8 flex justify-center items-center"><Loader2Icon className="animate-spin text-muted-foreground mr-2 h-6 w-6" /> Loading leaves...</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((l: any) => (
                  <TableRow key={l._id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-zinc-200">
                        <AvatarImage src={l.student?.profilePhoto} />
                        <AvatarFallback className="bg-zinc-100"><UserIcon className="h-5 w-5 text-zinc-400" /></AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                       <div className="font-medium">{l.student?.firstName ? `${l.student.firstName} ${l.student.lastName}` : 'Unknown'}</div>
                       <div className="text-xs text-muted-foreground">{l.student?.user?.email || "—"}</div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{l.reason}</TableCell>
                    <TableCell>{new Date(l.departureDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.returnDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={l.status === "APPROVED" ? "default" : l.status === "REJECTED" ? "destructive" : "secondary"}>
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setSelectedStudent(l.student); setDetailsOpen(true); }}
                        >
                          View Student
                        </Button>
                        {l.status === "PENDING" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(l._id, "APPROVED")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(l._id, "REJECTED")}>Reject</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLeaves.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No leave requests match this filter.</TableCell>
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
