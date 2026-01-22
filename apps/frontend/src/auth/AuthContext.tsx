import React, { createContext, useContext, useMemo, useState } from "react";

export type AppUser = {
    name: string;
    role: string;
    email: string;
};

type AuthContextValue = {
    user: AppUser | null;
    login: (email: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);

    const login = (email: string) => {
        // mock user (in futuro: Auth0 user profile)
        setUser({
            name: "Luisa Mele",
            role: "SOC Analyst",
            email,
        });
    };

    const logout = () => setUser(null);

    const value = useMemo(() => ({ user, login, logout }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
