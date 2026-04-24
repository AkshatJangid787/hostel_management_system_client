// src/components/auth/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Hydration error se bachne ke liye
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated) {
      // Agar login nahi hai toh bahar feko
      router.push("/login");
    } else if (user && !allowedRoles.includes(user.role)) {
      // Agar student admin page par aane ki koshish kare, toh usko wapas bhej do
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [isMounted, isAuthenticated, user, router, allowedRoles]);

  // Jab tak check chal raha hai, screen blank rakho taaki galat page flash na ho
  if (!isMounted || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null; 
  }

  return <>{children}</>;
}