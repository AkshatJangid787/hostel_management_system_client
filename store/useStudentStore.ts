import { create } from 'zustand';
import api from '@/lib/api';

interface StudentState {
  profileData: any | null;
  stats: {
    roomNumber: string;
    block: string;
    pendingDues: number;
    activeComplaints: number;
    approvedLeaves: number;
  };
  notices: any[];
  isLoading: boolean;
  hasProfile: boolean;
  lastFetched: number | null;
  
  fetchDashboardData: (force?: boolean) => Promise<void>;
  setProfileData: (data: any) => void;
  clearStore: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  profileData: null,
  stats: {
    roomNumber: "Not Assigned",
    block: "",
    pendingDues: 0,
    activeComplaints: 0,
    approvedLeaves: 0,
  },
  notices: [],
  isLoading: false,
  hasProfile: true,
  lastFetched: null,

  setProfileData: (data) => set({ profileData: data, hasProfile: !!data }),

  fetchDashboardData: async (force = false) => {
    const { lastFetched, isLoading } = get();
    
    // Skip if already loading
    if (isLoading) return;

    // Cache logic: 2 minutes unless forced
    const now = Date.now();
    if (!force && lastFetched && now - lastFetched < 120000) {
      return;
    }

    set({ isLoading: true });
    try {
      const [profileRes, feesRes, complaintsRes, leavesRes, noticesRes] = await Promise.all([
        api.get("/student/profile").catch(err => {
            if (err.response?.status === 404) return { data: { data: null } };
            throw err;
        }),
        api.get("/fees/my").catch(() => ({ data: { data: [] } })),
        api.get("/complaints/my").catch(() => ({ data: { data: [] } })),
        api.get("/leaves/my").catch(() => ({ data: { data: [] } })),
        api.get("/notices").catch(() => ({ data: { data: [] } }))
      ]);

      const profile = profileRes.data.data;
      
      if (!profile) {
          set({ hasProfile: false, isLoading: false, lastFetched: now });
          return;
      }

      const pendingFees = (feesRes.data.data || []).reduce((total: number, fee: any) => {
        return fee.status !== 'PAID' ? total + (fee.totalAmount - fee.paidAmount) : total;
      }, 0);

      const activeComps = (complaintsRes.data.data || []).filter(
        (c: any) => c.status !== 'RESOLVED'
      ).length;

      const approvedLvs = (leavesRes.data.data || []).filter(
        (l: any) => l.status === 'APPROVED'
      ).length;

      set({
        profileData: profile,
        hasProfile: true,
        stats: {
          roomNumber: profile.room?.roomNumber || "Not Assigned",
          block: profile.room?.block || "",
          pendingDues: pendingFees,
          activeComplaints: activeComps,
          approvedLeaves: approvedLvs,
        },
        notices: noticesRes.data.data || [],
        lastFetched: now,
      });

    } catch (error) {
      console.error("Error fetching student dashboard data", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearStore: () => set({
    profileData: null,
    stats: {
      roomNumber: "Not Assigned",
      block: "",
      pendingDues: 0,
      activeComplaints: 0,
      approvedLeaves: 0,
    },
    notices: [],
    lastFetched: null,
    hasProfile: true,
  })
}));
