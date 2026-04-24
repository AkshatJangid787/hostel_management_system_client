"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function StudentLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/leaves/my");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves", { reason, departureDate, returnDate });
      toast.success("Leave application submitted successfully!");
      setReason("");
      setDepartureDate("");
      setReturnDate("");
      setOpen(false);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Request Leave</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>From</Label><Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required /></div>
                <div className="space-y-2"><Label>To</Label><Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required /></div>
              </div>
              <Button type="submit" className="w-full">Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Loading leaves...</CardContent></Card>
      ) : leaves.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No leave requests yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {leaves.map((l: any) => (
            <Card key={l._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{l.reason}</CardTitle>
                  <Badge variant={l.status === "APPROVED" ? "default" : l.status === "REJECTED" ? "destructive" : "secondary"}>{l.status}</Badge>
                </div>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{new Date(l.departureDate).toLocaleDateString()} → {new Date(l.returnDate).toLocaleDateString()}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
