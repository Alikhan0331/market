'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Badge } from '../../ui/badge';
import { LogOut } from 'lucide-react';

export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4">
      <div />
      <div className="flex items-center gap-3">
        {user?.role && (
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-400 text-xs capitalize"
          >
            {user.role.toLowerCase()}
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-[#4F6EF7]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#4F6EF7]/20 text-[#4F6EF7] text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-zinc-700 bg-zinc-900 text-zinc-100"
          >
            <p className="px-3 py-2 text-xs text-zinc-500 truncate">{user?.email}</p>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="cursor-pointer text-zinc-300 hover:text-zinc-100 focus:bg-zinc-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
