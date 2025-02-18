import React from 'react';
import LeftSidebar from '../shared/left-sidebar.tsx';
import {useTheme} from "@/providers/theme-provider.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const {layout} = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      {(layout ==="left-sidebar" || layout === "double-sidebar") && <LeftSidebar />}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <main className="relative flex-1 overflow-y-auto bg-background focus:outline-none ">
          {children}
        </main>

      </div>
        <Toaster />
    </div>
  );
}
