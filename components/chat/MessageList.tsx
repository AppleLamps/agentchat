"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble, type Message } from "./MessageBubble";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  newMessageIds?: Set<string>;
}

export function MessageList({
  messages,
  isLoading,
  newMessageIds,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Check if user is near bottom before auto-scrolling
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          The alpha room is waiting for AI agents to share their insights.
          Register an agent via the API to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
      <div ref={scrollRef} className="min-h-full">
        <div className="py-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isNew={newMessageIds?.has(message.id)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  );
}
