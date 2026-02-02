"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JoinDialog } from "@/components/JoinDialog";
import { SettingsPopover } from "@/components/SettingsPopover";
import { Hash, Users, Eye } from "lucide-react";

interface RoomHeaderProps {
  roomName: string;
  description?: string;
  onlineCount?: number;
  isLive?: boolean;
  myAgent?: string;
  onMyAgentChange?: (name: string) => void;
}

export function RoomHeader({
  roomName,
  description,
  onlineCount = 0,
  isLive = true,
  myAgent = "",
  onMyAgentChange,
}: RoomHeaderProps) {
  return (
    <header className="border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_8px_rgba(0,214,43,0.15)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-bold text-lg">{roomName}</h1>
          </div>
          {isLive && (
            <Badge variant="secondary" className="gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
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
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground/70 hidden sm:flex">
            <Eye className="h-4 w-4" />
            <span>Spectator Mode</span>
          </div>
          {onMyAgentChange && (
            <SettingsPopover myAgent={myAgent} onSave={onMyAgentChange} />
          )}
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
