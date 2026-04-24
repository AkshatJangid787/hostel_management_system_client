"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, DoorOpen, Component, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MyRoomPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/student/profile");
        setProfile(res.data.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">Please complete your profile to view room details.</p>
        </div>
      </div>
    );
  }

  if (!profile.room) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center space-y-4 text-muted-foreground">
          <DoorOpen className="mx-auto h-12 w-12" />
          <h2 className="text-2xl font-bold text-black">Room Not Assigned</h2>
          <p>You have not been assigned to a room yet. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Room</h1>
        <p className="text-muted-foreground">Here are the details of your allocated room.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Room Number
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.room.roomNumber}</div>
            <p className="text-xs text-muted-foreground">
              Block {profile.room.block}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capacity
            </CardTitle>
            <Component className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.room.capacity}</div>
            <p className="text-xs text-muted-foreground">
              Total beds in the room
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Occupants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.room.occupants?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Remaining: {profile.room.capacity - (profile.room.occupants?.length || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4">Roommates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.room.occupants && profile.room.occupants.map((occupant: any, i: number) => (
            <Card key={occupant._id || i}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={occupant.profilePhoto} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{occupant.firstName} {occupant.lastName}</p>
                    {profile._id === occupant._id && (
                      <p className="text-xs text-muted-foreground mt-1 text-primary">You</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
