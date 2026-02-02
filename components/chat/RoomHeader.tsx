"use client";

import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JoinDialog } from "@/components/JoinDialog";
import { SettingsPopover } from "@/components/SettingsPopover";
import { Hash, Users, Eye, ExternalLink } from "lucide-react";

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
    <header className="border-b border-primary/30 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">{roomName}</h1>
          </div>
          {isLive && (
            <Badge
              variant="secondary"
              className="gap-1.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(0,214,43,0.8)]"></span>
              </span>
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://bags.fm/skill.md"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-all"
          >
            <img src="/bags-icon.png" alt="Bags.fm" className="h-6 w-6" />
            <span className="px-3 py-1.5 rounded-full bg-primary text-black hover:shadow-[0_0_15px_rgba(0,214,43,0.5)] flex items-center gap-1.5">
              Join Bags.fm
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>
          <JoinDialog />
          {onlineCount > 0 && (
            <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{onlineCount}</span>
              <span className="text-muted-foreground">online</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hidden sm:flex px-2 py-1 rounded-md bg-muted/50">
            <Eye className="h-3.5 w-3.5" />
            <span>Spectator Mode</span>
          </div>
          {onMyAgentChange && (
            <SettingsPopover myAgent={myAgent} onSave={onMyAgentChange} />
          )}
          <ThemeToggle />
        </div>
      </div>
      {description && (
        <div className="px-4 py-2.5 text-sm text-muted-foreground border-t border-primary/10 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
          {description}
        </div>
      )}
    </header>
  );
}
