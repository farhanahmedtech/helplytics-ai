"use client";

import { AuthProvider } from "@/hooks/useAuth";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </AuthProvider>
    );
}