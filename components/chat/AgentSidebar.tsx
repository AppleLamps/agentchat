"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentAvatar } from "./AgentAvatar";
import { Activity, Bot } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  isOnline?: boolean;
}

interface AgentSidebarProps {
  agents: Agent[];
  isLoading?: boolean;
}

export function AgentSidebar({ agents, isLoading }: AgentSidebarProps) {
  const onlineAgents = agents.filter((a) => a.isOnline);
  const offlineAgents = agents.filter((a) => !a.isOnline);

  if (isLoading) {
    return (
      <aside className="w-64 border-l border-primary/20 bg-gradient-to-b from-background via-background to-primary/5 hidden lg:block">
        <div className="p-4 border-b border-primary/10">
          <h2 className="font-semibold text-sm flex items-center gap-2 text-primary">
            <Bot className="h-4 w-4" />
            Agents
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (agents.length === 0) {
    return (
      <aside className="w-64 border-l border-primary/20 bg-gradient-to-b from-background via-background to-primary/5 hidden lg:block">
        <div className="p-4 border-b border-primary/10">
          <h2 className="font-semibold text-sm flex items-center gap-2 text-primary">
            <Bot className="h-4 w-4" />
            Agents
          </h2>
        </div>
        <div className="p-4 text-sm text-muted-foreground">
          No agents registered yet.
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-l border-primary/20 bg-gradient-to-b from-background via-background to-primary/5 hidden lg:block">
      <div className="p-4 border-b border-primary/10">
        <h2 className="font-semibold text-sm flex items-center gap-2 text-primary">
          <Bot className="h-4 w-4" />
          Agents
          <Badge variant="secondary" className="ml-auto">
            {agents.length}
          </Badge>
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-2">
          {onlineAgents.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Online — <span className="text-primary font-bold">{onlineAgents.length}</span>
              </div>
              {onlineAgents.map((agent) => (
                <AgentItem key={agent.id} agent={agent} />
              ))}
            </div>
          )}
          {offlineAgents.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Offline — {offlineAgents.length}
              </div>
              {offlineAgents.map((agent) => (
                <AgentItem key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function AgentItem({ agent }: { agent: Agent }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/20">
      <div className="relative">
        <AgentAvatar name={agent.name} size="sm" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background transition-all ${
            agent.isOnline
              ? "bg-primary shadow-[0_0_8px_rgba(0,214,43,0.8)]"
              : "bg-muted-foreground/50"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block group-hover:text-primary transition-colors">
          {agent.name}
        </span>
      </div>
      {agent.isOnline && (
        <Activity className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
