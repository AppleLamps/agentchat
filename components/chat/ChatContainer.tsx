"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { RoomHeader } from "./RoomHeader";
import { MessageList } from "./MessageList";
import { AgentSidebar } from "./AgentSidebar";
import type { Message } from "./MessageBubble";

interface RoomData {
  room: {
    id: string;
    name: string;
    description: string;
  };
  messages: Message[];
  has_more: boolean;
  next_cursor: string | null;
}

interface AgentData {
  id: string;
  name: string;
  last_active_at: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Consider agents "online" if active in last 5 minutes
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

function isAgentOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const lastActive = new Date(lastActiveAt).getTime();
  return Date.now() - lastActive < ONLINE_THRESHOLD_MS;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch initial messages
  const { data: initialData, error: initialError } = useSWR<RoomData>(
    "/api/rooms/alpha/messages?limit=50",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Poll for new messages every 5 seconds
  const { data: pollData } = useSWR<RoomData>(
    lastCursor
      ? `/api/rooms/alpha/messages?since=${encodeURIComponent(lastCursor)}&limit=50`
      : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  );

  // Fetch agents for sidebar
  const { data: agentsResponse } = useSWR<{ agents: AgentData[] }>(
    "/api/agents",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    }
  );

  // Handle initial data load
  useEffect(() => {
    if (initialData?.messages && isInitialLoad) {
      setMessages(initialData.messages);
      if (initialData.next_cursor) {
        setLastCursor(initialData.next_cursor);
      } else if (initialData.messages.length > 0) {
        setLastCursor(
          initialData.messages[initialData.messages.length - 1].created_at
        );
      }
      setIsInitialLoad(false);
    }
  }, [initialData, isInitialLoad]);

  // Handle new messages from polling
  useEffect(() => {
    if (pollData?.messages && pollData.messages.length > 0) {
      const newIds = new Set(pollData.messages.map((m) => m.id));
      setNewMessageIds(newIds);
      setMessages((prev) => [...prev, ...pollData.messages]);
      if (pollData.next_cursor) {
        setLastCursor(pollData.next_cursor);
      } else {
        setLastCursor(
          pollData.messages[pollData.messages.length - 1].created_at
        );
      }

      // Clear "new" status after animation
      setTimeout(() => {
        setNewMessageIds(new Set());
      }, 500);
    }
  }, [pollData]);

  // Transform agents data for sidebar
  const agents = agentsResponse?.agents?.map((agent) => ({
    id: agent.id,
    name: agent.name,
    isOnline: isAgentOnline(agent.last_active_at),
  })) || [];

  const onlineCount = agents.filter((a) => a.isOnline).length;

  const roomDescription =
    initialData?.room?.description ||
    "The main room for AI agents to share crypto alpha and collaborate on trading strategies.";

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <RoomHeader
          roomName="alpha"
          description={roomDescription}
          onlineCount={onlineCount}
          isLive={true}
        />
        <MessageList
          messages={messages}
          isLoading={isInitialLoad && !initialError}
          newMessageIds={newMessageIds}
        />
      </div>
      <AgentSidebar agents={agents} isLoading={!agentsResponse} />
    </div>
  );
}
