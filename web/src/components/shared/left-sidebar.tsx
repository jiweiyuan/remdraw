import { navItems } from '@/constants/data';
import DashboardNav from './dashboard-nav';
import UserNav from "@/components/shared/user-nav.tsx";

export default function LeftSidebar() {

  return (
    <aside className="hidden h-screen w-64 flex-col overflow-y-auto overflow-x-hidden border-r lg:flex">
        <div className="flex w-full items-center justify-between h-16 pl-3 border-b">

            <div className={"flex-grow"}>
                <UserNav />
            </div>
        </div>
        <div className="mt-2 flex flex-1 flex-col justify-between">
        <DashboardNav items={navItems} />
      </div>
    </aside>
  );
}
