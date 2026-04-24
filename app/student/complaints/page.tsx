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

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/complaints/my");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/complaints", { title, description, type: "OTHER" });
      toast.success("Complaint filed successfully!");
      setTitle("");
      setDescription("");
      setOpen(false);
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit ticket");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Complaints</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Complaint</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>File a Complaint</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} /></div>
              <Button type="submit" className="w-full">Submit Complaint</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Loading complaints...</CardContent></Card>
      ) : complaints.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No complaints filed yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {complaints.map((c: any) => (
            <Card key={c._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <Badge variant={c.status === "RESOLVED" ? "default" : "secondary"}>{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent><p className="text-sm">{c.description}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
