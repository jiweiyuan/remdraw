import {create} from "zustand";
import {getToken} from "@/lib/token";
interface AuthState {
    verfied: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
    verfied: !!getToken()
}));