import { create } from 'zustand';

interface LeaveStore {
  totalLeaves: number;
  setTotalLeaves: (value: number) => void;
}

export const useLeaveStore = create<LeaveStore>((set) => ({
  totalLeaves: 0,
  setTotalLeaves: (value) => set({ totalLeaves: value }),
}));

interface OfficialTravelStore {
  totalOfficialTravels: number;
  setTotalOfficialTravels: (value: number) => void;
}

export const useOfficialTravelStore = create<OfficialTravelStore>((set) => ({
  totalOfficialTravels: 0,
  setTotalOfficialTravels: (value) => set({ totalOfficialTravels: value }),
}));
