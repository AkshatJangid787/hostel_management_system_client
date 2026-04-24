"use client"

import * as React from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios"
import { io } from "socket.io-client"
import { toast } from "sonner"

const socketUrl = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useStudentStore } from "@/store/useStudentStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboardIcon, 
  DoorClosedIcon, 
  CreditCardIcon, 
  UsersIcon, 
  FileWarningIcon, 
  CalendarOffIcon, 
  UserPlusIcon,
  TentIcon,
  BellIcon
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userContext = useAuthStore((state) => state.user);
  const userRole = userContext?.role || "STUDENT";
  
  const [noticesCount, setNoticesCount] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (!userRole) return;
    const fetchNoticesCount = async () => {
      try {
        const res = await api.get('/notices');
        const count = res.data.data?.length || 0;
        setNoticesCount(count > 0 ? count : undefined);
      } catch (err) {
        // silently ignore
      }
    };
    fetchNoticesCount();

    const socket = io(socketUrl);
    
    socket.on('noticeUpdate', (notice) => {
      fetchNoticesCount();
      if (notice) {
        toast.info("New Notice", {
          description: notice.title || "A new notice has been posted.",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userRole]);

  const adminNav = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Students",
      url: "/admin/register",
      icon: <UsersIcon />,
    },
    {
      title: "Rooms",
      url: "/admin/rooms",
      icon: <DoorClosedIcon />,
    },
    {
      title: "Complaints",
      url: "/admin/complaints",
      icon: <FileWarningIcon />,
    },
    {
      title: "Notices",
      url: "/admin/notices",
      icon: <BellIcon />,
      badge: noticesCount,
    },
    {
      title: "Leaves",
      url: "/admin/leaves",
      icon: <CalendarOffIcon />,
    },
    {
      title: "Fees",
      url: "/admin/fees",
      icon: <CreditCardIcon />,
    },
  ];

  const studentNav = [
    {
      title: "My Dashboard",
      url: "/student",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "My Profile",
      url: "/student/profile",
      icon: <UsersIcon />,
    },
    {
      title: "My Room",
      url: "/student/room",
      icon: <DoorClosedIcon />,
    },
    {
      title: "Notices",
      url: "/student/notices",
      icon: <BellIcon />,
      badge: noticesCount,
    },
    {
      title: "My Complaints",
      url: "/student/complaints",
      icon: <FileWarningIcon />,
    },
    {
      title: "Leave Applications",
      url: "/student/leaves",
      icon: <CalendarOffIcon />,
    },
    {
      title: "Fee Records",
      url: "/student/fees",
      icon: <CreditCardIcon />,
    },
  ];

  const navItems = userRole === "ADMIN" ? adminNav : studentNav;

  const { profileData } = useStudentStore();

  const userDisplayName = profileData?.firstName 
    ? `${profileData.firstName} ${profileData.lastName || ''}`
    : userContext?.email?.split('@')[0] || "User";

  const userData = {
    name: userDisplayName,
    email: userContext?.email || "user@example.com",
    avatar: profileData?.profilePhoto || "https://github.com/shadcn.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <TentIcon className="size-5!" />
                <span className="text-base font-semibold">HostelSphere</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
