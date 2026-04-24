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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserIcon, Loader2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useAdminStore } from "@/store/useAdminStore";

export default function AdminRooms() {
  const { 
    allRooms: rooms, 
    allStudents: students, 
    isLoading, 
    fetchAllRooms, 
    fetchAllStudents 
  } = useAdminStore();

  const [open, setOpen] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);
  
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("1");
  const [capacity, setCapacity] = useState("2");
  
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("ALL");

  const [selectedRoomDetails, setSelectedRoomDetails] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchAllRooms();
    fetchAllStudents();
  }, [fetchAllRooms, fetchAllStudents]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/rooms", { 
        roomNumber, 
        block: floor, 
        capacity: parseInt(capacity),
        type: "NON_AC"
      });
      toast.success("Room created successfully!");
      setRoomNumber("");
      setOpen(false);
      // Refresh global room list
      await fetchAllRooms(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create room");
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom && selectedStudentEmail) {
      try {
        const student: any = students.find((s: any) => s.user?.email === selectedStudentEmail);
        if(!student) {
            toast.error("Student not found");
            return;
        }
        if(!student.firstName) {
            toast.error("Student must complete their profile before room allocation");
            return;
        }

        await api.post("/rooms/allocate", { roomId: selectedRoom, studentProfileId: student._id });
        toast.success("Student assigned to room!");
        setAllocOpen(false);
        // Refresh global data to show updated occupancy
        await fetchAllRooms(true);
        await fetchAllStudents(true);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to assign student");
      }
    }
  };

  const allocatedStudentIds = rooms.flatMap((r: any) => r.occupants?.map((o: any) => o._id) || []);
  const unallocatedStudents = students.filter((s: any) => !allocatedStudentIds.includes(s._id));

  const filteredRooms = rooms.filter((r: any) => {
     // 1. Occupancy matching
     const occCount = r.occupants?.length || 0;
     const isFull = occCount >= r.capacity;
     const isEmpty = occCount === 0;
     const isPartial = occCount > 0 && !isFull;

     let matchesOccupancy = true;
     if (occupancyFilter === "FULL") matchesOccupancy = isFull;
     if (occupancyFilter === "PARTIAL") matchesOccupancy = isPartial;
     if (occupancyFilter === "EMPTY") matchesOccupancy = isEmpty;
     if (occupancyFilter === "AVAILABLE") matchesOccupancy = !isFull;

     if (!matchesOccupancy) return false;

     // 2. Text Search matching
     if (!search) return true;
     const term = search.toLowerCase();
     if (r.roomNumber && String(r.roomNumber).toLowerCase().includes(term)) return true;
     if (r.block && String(r.block).toLowerCase().includes(term)) return true;
     
     // Search in occupants
     if (r.occupants && r.occupants.some((o: any) => 
        (o.firstName && o.firstName.toLowerCase().includes(term)) ||
        (o.lastName && o.lastName.toLowerCase().includes(term)) ||
        (o.enrollmentNo && o.enrollmentNo.toLowerCase().includes(term)) ||
        (o.user?.email && o.user.email.toLowerCase().includes(term))
     )) return true;

     return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <div className="flex gap-2">
          <Dialog open={allocOpen} onOpenChange={setAllocOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Allocate Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Allocate Room to Student</DialogTitle></DialogHeader>
              <form onSubmit={handleAllocate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                    <SelectContent>
                      {rooms.filter((r: any) => (r.occupants?.length || 0) < r.capacity).map((r: any) => (
                        <SelectItem key={r._id} value={r._id}>Room {r.roomNumber} ({(r.occupants?.length || 0)}/{r.capacity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={selectedStudentEmail} onValueChange={setSelectedStudentEmail}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {unallocatedStudents.map((s: any) => (
                        <SelectItem key={s._id} value={s.user?.email}>{s.user?.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Allocate</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Room</DialogTitle></DialogHeader>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div className="space-y-2"><Label>Room Number</Label><Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Floor</Label><Input value={floor} onChange={(e) => setFloor(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required /></div>
                <Button type="submit" className="w-full">Create Room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Search by room no, block, or student name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by occupancy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Rooms</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="EMPTY">Entirely Empty</SelectItem>
            <SelectItem value="PARTIAL">Partially Filled</SelectItem>
            <SelectItem value="FULL">Fully Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Floor/Block</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((r: any) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium text-base">Room {r.roomNumber}</TableCell>
                    <TableCell>{r.block || "1"}</TableCell>
                    <TableCell>{r.capacity} Beds</TableCell>
                    <TableCell>
                       <Badge variant={r.occupants?.length >= r.capacity ? "destructive" : "default"}>
                         {r.occupants?.length || 0} / {r.capacity}
                       </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.occupants?.map((o: any) => o.firstName || o.user?.email || "Unknown").join(", ") || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedRoomDetails(r); setDetailsOpen(true); }}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRooms.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                       No rooms match your search.
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Room Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {selectedRoomDetails ? (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold">Room {selectedRoomDetails.roomNumber}</h3>
                  <p className="text-sm text-zinc-500">Block/Floor: {selectedRoomDetails.block || "1"}</p>
                </div>
                <div className="text-right">
                  <Badge variant={selectedRoomDetails.occupants?.length >= selectedRoomDetails.capacity ? "destructive" : "default"} className="text-base px-3 py-1">
                    {selectedRoomDetails.occupants?.length || 0} / {selectedRoomDetails.capacity} Occupied
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">Allocated Students</h4>
                {(selectedRoomDetails.occupants?.length || 0) === 0 ? (
                  <div className="py-8 text-center text-zinc-500 border rounded-lg border-dashed">
                    No students currently allocated to this room.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {selectedRoomDetails.occupants.map((student: any) => (
                      <div key={student._id} className="flex items-center bg-zinc-50 p-3 rounded-lg border border-zinc-100 shadow-sm gap-4">
                        <Avatar className="h-12 w-12 border border-zinc-200 shadow-sm">
                          <AvatarImage src={student.profilePhoto} />
                          <AvatarFallback className="bg-white"><UserIcon className="h-6 w-6 text-zinc-400" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 truncate">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-zinc-500 truncate">{student.user?.email || "No Email"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-zinc-700">{student.enrollmentNo || "—"}</p>
                          <p className="text-xs text-zinc-400">{student.contactNumber || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
