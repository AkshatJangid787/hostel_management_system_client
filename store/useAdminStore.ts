import { create } from 'zustand';
import api from '@/lib/api';

interface AdminState {
  statsData: {
    totalStudents: number;
    totalRooms: number;
    pendingLeaves: number;
    openComplaints: number;
  };
  recentComplaints: any[];
  recentLeaves: any[];
  allStudents: any[];
  allRooms: any[];
  isLoading: boolean;
  lastFetched: number | null;
  
  fetchAdminData: (force?: boolean) => Promise<void>;
  fetchAllStudents: (force?: boolean) => Promise<void>;
  fetchAllRooms: (force?: boolean) => Promise<void>;
  clearStore: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  statsData: {
    totalStudents: 0,
    totalRooms: 0,
    pendingLeaves: 0,
    openComplaints: 0,
  },
  recentComplaints: [],
  recentLeaves: [],
  allStudents: [],
  allRooms: [],
  isLoading: false,
  lastFetched: null,

  fetchAdminData: async (force = false) => {
    const { lastFetched, isLoading } = get();
    
    if (isLoading) return;

    const now = Date.now();
    if (!force && lastFetched && now - lastFetched < 120000) {
      return;
    }

    set({ isLoading: true });
    try {
      const [roomsRes, compRes, leavesRes, studentsRes] = await Promise.all([
        api.get("/rooms").catch(() => ({ data: { data: [] } })),
        api.get("/complaints/all").catch(() => ({ data: { data: [] } })),
        api.get("/leaves/all").catch(() => ({ data: { data: [] } })),
        api.get("/students").catch(() => ({ data: { data: [] } }))
      ]);

      const rooms = roomsRes.data.data || [];
      const complaints = compRes.data.data || [];
      const leaves = leavesRes.data.data || [];
      const students = studentsRes.data.data || [];

      const openPendingComplaints = complaints.filter(
        (c: any) => c.status === 'PENDING' || c.status === 'IN_PROGRESS' || c.status === 'open'
      );
      const pendingLeavesRequests = leaves.filter(
        (l: any) => l.status === 'PENDING' || l.status === 'pending'
      );

      set({
        statsData: {
          totalStudents: students.length,
          totalRooms: rooms.length,
          pendingLeaves: pendingLeavesRequests.length,
          openComplaints: openPendingComplaints.length,
        },
        recentComplaints: openPendingComplaints.slice(0, 4),
        recentLeaves: pendingLeavesRequests.slice(0, 4),
        allStudents: students,
        allRooms: rooms,
        lastFetched: now,
      });

    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllStudents: async (force = false) => {
    const { allStudents, isLoading } = get();
    if (isLoading) return;
    if (!force && allStudents.length > 0) return;

    set({ isLoading: true });
    try {
      const res = await api.get("/students");
      set({ allStudents: res.data.data || [] });
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllRooms: async (force = false) => {
    const { allRooms, isLoading } = get();
    if (isLoading) return;
    if (!force && allRooms.length > 0) return;

    set({ isLoading: true });
    try {
      const res = await api.get("/rooms");
      set({ allRooms: res.data.data || [] });
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearStore: () => set({
    statsData: {
      totalStudents: 0,
      totalRooms: 0,
      pendingLeaves: 0,
      openComplaints: 0,
    },
    recentComplaints: [],
    recentLeaves: [],
    allStudents: [],
    allRooms: [],
    lastFetched: null,
  })
}));
