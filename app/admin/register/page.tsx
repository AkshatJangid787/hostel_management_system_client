"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2Icon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAdminStore } from "@/store/useAdminStore";

export default function AdminStudentsPage() {
  const { allStudents: students, isLoading, fetchAllStudents } = useAdminStore();
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchAllStudents();
  }, [fetchAllStudents]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", { email, password, role: "STUDENT" });
      toast.success("Student account provisioned!");
      setEmail("");
      setPassword("");
      setOpen(false);
      // Force refresh the global student list
      await fetchAllStudents(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter((s: any) => {
    const matchesSearch = s.user?.email?.toLowerCase().includes(search.toLowerCase()) || 
      (s.firstName && s.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (s.lastName && s.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" ? true :
      statusFilter === "ACTIVE" ? !!s.firstName :
      !s.firstName;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Students</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Register Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Student Account</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>Register Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Search students by email, name, or enrollment no..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Students</SelectItem>
            <SelectItem value="ACTIVE">Active Profiles</SelectItem>
            <SelectItem value="PENDING">Pending Setup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
         <Card><CardContent className="py-8 text-center text-muted-foreground"><Loader2Icon className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading students...</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-zinc-200">
                        <AvatarImage src={s.profilePhoto} />
                        <AvatarFallback className="bg-zinc-100"><UserIcon className="h-5 w-5 text-zinc-400" /></AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{s.user?.email || "—"}</TableCell>
                    <TableCell>{s.firstName ? `${s.firstName} ${s.lastName || ""}` : "Profile Pending"}</TableCell>
                    <TableCell>{s.enrollmentNo || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${s.firstName ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {s.firstName ? "Active" : "Pending Profile"}
                      </span>
                    </TableCell>
                    <TableCell>
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedStudent(s); setDetailsOpen(true); }}
                       >
                          View Details
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No students match your search.
                    </TableCell>
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
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <p className={`font-medium ${selectedStudent.firstName ? "text-green-600" : "text-yellow-600"}`}>
                    {selectedStudent.firstName ? "Active Profile" : "Profile Pending Setup"}
                  </p>
                </div>
                <div>
                   <span className="text-sm font-medium text-muted-foreground">System Email</span>
                   <p className="font-medium text-zinc-900">{selectedStudent.user?.email || "—"}</p>
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
