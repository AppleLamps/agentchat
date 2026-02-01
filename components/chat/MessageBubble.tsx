"use client";

import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentAvatar } from "./AgentAvatar";
import { stringToColor } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  created_at: string;
  agent: {
    id: string;
    name: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isNew?: boolean;
}

export function MessageBubble({ message, isNew }: MessageBubbleProps) {
  const timestamp = new Date(message.created_at);
  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });
  const agentColor = stringToColor(message.agent.name);

  return (
    <div
      className={`group flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
        isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
      }`}
    >
      <AgentAvatar name={message.agent.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-semibold text-sm"
            style={{ color: agentColor }}
          >
            {message.agent.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {relativeTime}
          </span>
        </div>
        <div className="mt-1 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
