import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {ChevronsUpDown} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {ModeToggle} from "@/components/shared/theme-toggle.tsx";
import {clearToken} from "@/lib/token.ts";

export default function UserNav() {
  const logout = () => {
    clearToken();
    window.location.href = '/login';
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-12 w-full items-center hover:cursor-pointer">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={
                './avatars/04.png'
              }
              alt={''}
            />
            <AvatarFallback>J</AvatarFallback>
          </Avatar>

          <span className="text-xs font-semibold h-8 leading-8 ml-1.5">
              Jiwei Yuan
          </span>
          <ChevronsUpDown className={cn("h-4")}/>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{'Jiwei Yuan'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {'ji-weiyuan@outlook.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            {/*<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*/}
          </DropdownMenuItem>
          {/*<DropdownMenuItem>*/}
          {/*  Billing*/}
          {/*  /!*<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*!/*/}
          {/*</DropdownMenuItem>*/}
          <DropdownMenuItem>
            Settings
            {/*<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>*/}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator></DropdownMenuSeparator>
        <DropdownMenuLabel className="font-normal">
          <ModeToggle></ModeToggle>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Log out
          {/*<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>*/}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
