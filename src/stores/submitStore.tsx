import { create } from "zustand";

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
  officialTravelData: any;
  setOfficialTravelData: (data: any) => void;
}

export const useOfficialTravelStore = create<OfficialTravelStore>((set) => ({
  totalOfficialTravels: 0,
  officialTravelData: null,
  setOfficialTravelData: (data) => set({ officialTravelData: data }),
  setTotalOfficialTravels: (value) => set({ totalOfficialTravels: value }),
}));

interface DeclarationStore {
  declarationData: any;
  setDeclarationData: (data: any) => void;
  clearDeclarationData: () => void;
}

export const useDeclarationStore = create<DeclarationStore>((set) => ({
  declarationData: null,
  setDeclarationData: (data) => set({ declarationData: data }),
  clearDeclarationData: () => set({ declarationData: null }),
}));
