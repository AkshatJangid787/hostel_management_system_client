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
import { Plus, Trash2 } from "lucide-react";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/notices");
      setNotices(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch notices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/notices", { title, content, type: "GENERAL" }); // Providing a default type in case backend requires it
      toast.success("Notice created successfully!");
      setTitle("");
      setContent("");
      setOpen(false);
      fetchNotices();
    } catch (err: any) {
       toast.error(err.response?.data?.message || "Failed to create notice");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted successfully!");
      fetchNotices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete notice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notices</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Notice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Notice</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} /></div>
              <Button type="submit" className="w-full">Send Notice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
         <Card><CardContent className="py-8 text-center text-muted-foreground">Loading notices...</CardContent></Card>
      ) : notices.length === 0 ? (
         <Card><CardContent className="py-8 text-center text-muted-foreground">No notices published yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((n: any) => (
            <Card key={n._id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{n.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(n._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent><p className="text-sm">{n.content}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
