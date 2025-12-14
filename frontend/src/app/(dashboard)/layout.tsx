'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { RouteGuard } from '@/components/route-guard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard>
            <div className="flex h-screen overflow-hidden bg-white">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-white">
                    {children}
                </main>
            </div>
        </RouteGuard>
    );
}
