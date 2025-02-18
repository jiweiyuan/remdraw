import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';
import { NavLink } from 'react-router-dom';
import { Icons } from '../ui/icons';

type DashboardNavProps = {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
};

type DashboardNavItemProps = {
  item: NavItem;
  setOpen?: Dispatch<SetStateAction<boolean>>;
};

const DashboardNavItem = ({ item, setOpen }: DashboardNavItemProps) => {
  const Icon = Icons[item.icon || 'arrowRight'];

  return (
    <div
      className="space-y-3 pl-5 pr-3 py-1"
      key={item.href}
      onClickCapture={() => {
        if (setOpen) {
          setOpen(false);
        }
      }}
    >
      <NavLink
        className={({ isActive }) =>
          cn(
            'flex transform items-center pl-2 py-2 mr-2 transition-colors duration-300 hover:bg-gray-100 hover:dark:text-black rounded',
            isActive && 'bg-surface dark:text-black'
          )
        }
        to={item.href}
        end
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="mx-2 text-sm">{item.label}</span>
      </NavLink>
    </div>
  );
};

export default function DashboardNav({ items, setOpen }: DashboardNavProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <nav className="-mx-3">
      {items.map((item) => (
        <DashboardNavItem key={item.href} item={item} setOpen={setOpen} />
      ))}
    </nav>
  );
}
