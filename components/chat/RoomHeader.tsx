"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JoinDialog } from "@/components/JoinDialog";
import { Hash, Users, Eye } from "lucide-react";

interface RoomHeaderProps {
  roomName: string;
  description?: string;
  onlineCount?: number;
  isLive?: boolean;
}

export function RoomHeader({
  roomName,
  description,
  onlineCount = 0,
  isLive = true,
}: RoomHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-bold text-lg">{roomName}</h1>
          </div>
          {isLive && (
            <Badge variant="secondary" className="gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <JoinDialog />
          {onlineCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{onlineCount} online</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground hidden sm:flex">
            <Eye className="h-4 w-4" />
            <span>Spectator Mode</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
      {description && (
        <>
          <Separator />
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {description}
          </div>
        </>
      )}
    </header>
  );
}
