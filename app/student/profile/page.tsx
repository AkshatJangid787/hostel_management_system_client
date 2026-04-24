"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User,
  Phone,
  Mail,
  Hash,
  Users,
  Camera,
  Edit3,
  X,
  Save,
  House,
  Loader2,
  Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  enrollmentNo: z.string().min(5, "Enrollment number is required"),
  contactNumber: z.string().min(10, "Valid contact number required").max(15),
  parentContact: z.string().min(10, "Parent contact required").max(15),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

import { useStudentStore } from "@/store/useStudentStore";

export default function StudentProfile() {
  const user = useAuthStore((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { 
    profileData: studentData, 
    hasProfile: profileExists, 
    isLoading, 
    fetchDashboardData 
  } = useStudentStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (studentData) {
      reset({
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        enrollmentNo: studentData.enrollmentNo,
        contactNumber: studentData.contactNumber,
        parentContact: studentData.parentContact,
      });
    }
  }, [studentData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("enrollmentNo", data.enrollmentNo);
      formData.append("contactNumber", data.contactNumber);
      formData.append("parentContact", data.parentContact);

      if (selectedFile) {
        formData.append("profilePhoto", selectedFile);
      }

      await api.post("/student/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Refresh global store data
      await fetchDashboardData(true);
      
      setIsEditMode(false);
      toast.success(profileExists ? "Profile updated successfully!" : "Profile created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit profile details");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading identity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Student Identity</h1>
          <p className="text-muted-foreground mt-1">View and manage your personal details and room assignment.</p>
        </div>
        {!isEditMode && profileExists && (
          <Button onClick={() => setIsEditMode(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar and Quick Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center bg-muted/30 pb-8 border-b border-muted">
              <div className="relative mx-auto w-32 h-32 mb-4 group">
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20 shadow-2xl">
                  <AvatarImage src={previewUrl || studentData?.profilePhoto} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                    {studentData?.firstName?.[0]}{studentData?.lastName?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                {isEditMode && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors ring-2 ring-background ring-offset-2 ring-offset-primary/10">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <CardTitle className="text-2xl">{studentData?.firstName} {studentData?.lastName}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 mt-1 italic">
                <Mail className="h-3 w-3" /> {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-primary/20">Assigned Residence</Badge>
                <div className="flex items-center gap-2 text-xl font-bold">
                  <House className="h-5 w-5 text-primary" />
                  {studentData?.room?.roomNumber || "Pending Allocation"}
                </div>
                {studentData?.room?.block && (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">Block {studentData.room.block}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Form/View */}
        <div className="lg:col-span-2">
          {!isEditMode && profileExists ? (
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle>Detailed Information</CardTitle>
                <CardDescription>Verified academic and personal records</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> First Name
                    </p>
                    <p className="text-lg font-medium">{studentData.firstName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3" /> Last Name
                    </p>
                    <p className="text-lg font-medium">{studentData.lastName}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Enrollment ID
                  </p>
                  <p className="text-lg font-medium">{studentData.enrollmentNo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Contact No.
                    </p>
                    <p className="text-lg font-medium">{studentData.contactNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Users className="h-3 w-3" /> Parent Contact
                    </p>
                    <p className="text-lg font-medium">{studentData.parentContact}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t pt-4">
                <p className="text-[11px] text-muted-foreground italic">Last verified: {new Date(studentData.updatedAt).toLocaleDateString()}</p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{profileExists ? "Update Your Information" : "Create Your Profile"}</CardTitle>
                <CardDescription>Please ensure all details are accurate as per your college records.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">First Name</Label>
                      <Input {...register("firstName")} className="focus-visible:ring-primary shadow-sm" placeholder="e.g. Rahul" />
                      {errors.firstName && <p className="text-[10px] text-destructive font-bold uppercase">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Last Name</Label>
                      <Input {...register("lastName")} className="focus-visible:ring-primary shadow-sm" placeholder="e.g. Sharma" />
                      {errors.lastName && <p className="text-[10px] text-destructive font-bold uppercase">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Enrollment Number</Label>
                    <Input {...register("enrollmentNo")} className="focus-visible:ring-primary shadow-sm" placeholder="e.g. BT21CSE042" />
                    {errors.enrollmentNo && <p className="text-[10px] text-destructive font-bold uppercase">{errors.enrollmentNo.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Personal Contact</Label>
                      <Input {...register("contactNumber")} className="focus-visible:ring-primary shadow-sm" placeholder="+91 XXXXX XXXXX" />
                      {errors.contactNumber && <p className="text-[10px] text-destructive font-bold uppercase">{errors.contactNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">Parent's Contact</Label>
                      <Input {...register("parentContact")} className="focus-visible:ring-primary shadow-sm" placeholder="+91 XXXXX XXXXX" />
                      {errors.parentContact && <p className="text-[10px] text-destructive font-bold uppercase">{errors.parentContact.message}</p>}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <Button type="submit" className="flex-1 gap-2 h-11 text-lg shadow-lg shadow-primary/20" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      {profileExists ? "Save Changes" : "Register Identity"}
                    </Button>
                    {isEditMode && (
                      <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="h-11">
                        <X className="h-5 w-5 mr-2" /> Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
