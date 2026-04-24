"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2Icon, UserIcon } from "lucide-react";

export default function AdminFeesPage() {
  const [feeForm, setFeeForm] = useState({
    studentId: "", feeType: "HOSTEL_FEE", totalAmount: "", dueDate: ""
  });
  const [payForm, setPayForm] = useState({ feeRecordId: "", amountToPay: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchFeesAndStudents = async () => {
    setIsLoading(true);
    try {
      const [resFees, resStudents] = await Promise.all([
        api.get("/fees/all"),
        api.get("/students")
      ]);
      setFees(resFees.data.data || []);
      setStudents(resStudents.data.data || []);
    } catch (err) {
      toast.error("Failed to load fee configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesAndStudents();
  }, []);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/fees", feeForm);
      toast.success("Fee record created successfully!");
      setFeeForm({ studentId: "", feeType: "HOSTEL_FEE", totalAmount: "", dueDate: "" });
      fetchFeesAndStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create fee record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/fees/${payForm.feeRecordId}/pay`, { amountToPay: Number(payForm.amountToPay) });
      toast.success("Payment recorded successfully!");
      setPayForm({ feeRecordId: "", amountToPay: "" });
      fetchFeesAndStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this fee record?")) return;
    try {
      await api.delete(`/fees/${id}`);
      toast.success("Fee record deleted");
      fetchFeesAndStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete fee record");
    }
  };

  const filteredFees = fees.filter((f: any) => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Fee Management</h1>
        <p className="text-zinc-500 mt-1">Create fee structs and record manual payments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Fee Record */}
        <Card className="shadow-xs border-zinc-200">
          <CardHeader>
            <CardTitle>Create New Fee Record</CardTitle>
            <CardDescription>Assign a fee to a specific student profile ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFee} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={feeForm.studentId} onValueChange={(v) => setFeeForm({ ...feeForm, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student profile" /></SelectTrigger>
                  <SelectContent>
                    {students.filter((s: any) => s.firstName).map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>{s.user?.email} - {s.firstName} {s.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <select
                  id="feeType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                  value={feeForm.feeType}
                  onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                >
                  <option value="HOSTEL_FEE">Hostel Fee</option>
                  <option value="MESS_FEE">Mess Fee</option>
                  <option value="FINE">Fine</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                <Input
                  id="totalAmount" type="number" required
                  value={feeForm.totalAmount}
                  onChange={(e) => setFeeForm({ ...feeForm, totalAmount: e.target.value })}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate" type="date" required
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                Create Fee Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Record Payment */}
        <Card className="shadow-xs border-zinc-200">
          <CardHeader>
            <CardTitle>Record Manual Payment</CardTitle>
            <CardDescription>Log payments received externally for a fee ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feeRecordId">Fee Record ID</Label>
                <Input
                  id="feeRecordId" required
                  value={payForm.feeRecordId}
                  onChange={(e) => setPayForm({ ...payForm, feeRecordId: e.target.value })}
                  placeholder="Paste Fee Record ID from bottom list"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountToPay">Amount Received (₹)</Label>
                <Input
                  id="amountToPay" type="number" required
                  value={payForm.amountToPay}
                  onChange={(e) => setPayForm({ ...payForm, amountToPay: e.target.value })}
                  placeholder="e.g. 15000"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Submit Payment Receipt
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 flex justify-center items-center"><Loader2Icon className="animate-spin text-muted-foreground mr-2 h-6 w-6" /> Loading records...</CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>All Student Fee Records</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((f: any) => (
                  <TableRow key={f._id}>
                    <TableCell>
                      <Avatar className="h-8 w-8 border border-zinc-200">
                        <AvatarImage src={f.student?.profilePhoto} />
                        <AvatarFallback className="bg-zinc-100"><UserIcon className="h-4 w-4 text-zinc-400" /></AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{f.student?.user?.email || "Unknown"}</TableCell>
                    <TableCell className="font-mono text-xs">{f._id}</TableCell>
                    <TableCell>{f.feeType}</TableCell>
                    <TableCell>₹{f.totalAmount}</TableCell>
                    <TableCell>₹{f.paidAmount}</TableCell>
                    <TableCell>{new Date(f.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "PAID" ? "default" : f.status === "PARTIAL" ? "secondary" : "destructive"}>
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFee(f._id)} className="text-red-500 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700">X</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">No fee records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
