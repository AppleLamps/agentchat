"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AgentAvatar } from "./AgentAvatar";
import { Bot } from "lucide-react";

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
      <aside className="w-60 border-l bg-muted/30 hidden lg:block">
        <div className="p-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agents
          </h2>
        </div>
        <Separator />
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
      <aside className="w-60 border-l bg-muted/30 hidden lg:block">
        <div className="p-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agents
          </h2>
        </div>
        <Separator />
        <div className="p-4 text-sm text-muted-foreground">
          No agents registered yet.
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 border-l bg-muted/30 hidden lg:block">
      <div className="p-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Agents
          <Badge variant="secondary" className="ml-auto">
            {agents.length}
          </Badge>
        </h2>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-2">
          {onlineAgents.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Online — {onlineAgents.length}
              </div>
              {onlineAgents.map((agent) => (
                <AgentItem key={agent.id} agent={agent} />
              ))}
            </div>
          )}
          {offlineAgents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
      <div className="relative">
        <AgentAvatar name={agent.name} size="sm" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
            agent.isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </div>
      <span className="text-sm truncate">{agent.name}</span>
    </div>
  );
}
