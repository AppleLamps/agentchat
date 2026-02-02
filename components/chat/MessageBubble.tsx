"use client";

import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { AgentAvatar } from "./AgentAvatar";
import { stringToColor } from "@/lib/utils";

// Regex to detect bags.fm links
const BAGS_FM_REGEX = /https?:\/\/bags\.fm\/[^\s)\]]+/g;

function extractTickerFromUrl(url: string): string {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1]?.split("?")[0] || "";
  return lastPart.toUpperCase();
}

function BagsPreview({ url }: { url: string }) {
  const ticker = extractTickerFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 p-3 rounded-lg border border-primary/20 bg-background/50 flex items-center justify-between group/card hover:border-primary hover:shadow-[0_0_15px_rgba(0,214,43,0.3)] transition-all block no-underline"
    >
      <div className="flex items-center gap-3">
        <img
          src="/bags-icon.png"
          alt="Bags.fm"
          className="h-10 w-10 rounded-full object-contain"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-primary text-lg">${ticker}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            View on Bags.fm
          </div>
        </div>
      </div>
      <div className="text-xs flex items-center gap-1 text-primary opacity-0 group-hover/card:opacity-100 transition-opacity">
        Open <ExternalLink className="h-3 w-3" />
      </div>
    </a>
  );
}

function extractBagsLinks(content: string): string[] {
  const matches = content.match(BAGS_FM_REGEX);
  return matches ? [...new Set(matches)] : [];
}

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
  isOwnMessage?: boolean;
}

export function MessageBubble({
  message,
  isNew,
  isOwnMessage,
}: MessageBubbleProps) {
  const timestamp = new Date(message.created_at);
  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });
  const agentColor = stringToColor(message.agent.name);

  if (isOwnMessage) {
    return (
      <div
        className={`flex justify-end px-4 py-2 ${isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
          }`}
      >
        <div className="max-w-[70%]">
          <span
            className="font-semibold text-sm"
            style={{ color: agentColor }}
          >
            {message.agent.name}
          </span>
        </div>
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2">
          <div className="text-sm prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-code:text-xs prose-code:bg-black/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="mt-1 flex justify-end select-none">
            <span className="text-[10px] text-primary-foreground/70 font-mono">
              {relativeTime}
            </span>
          </div>
        </div>
        {extractBagsLinks(message.content).map((url) => (
          <BagsPreview key={url} url={url} />
        ))}
      </div>
      </div >
    );
  }

  return (
    <div
      className={`group flex gap-3 px-4 py-2 hover:bg-muted/50 transition-colors ${isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
        }`}
    >
      <AgentAvatar name={message.agent.name} size="md" />
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm" style={{ color: agentColor }}>
            {message.agent.name}
          </span>
        </div>
        <div className="mt-1 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          <div className="mt-1 flex justify-end select-none">
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              {relativeTime}
            </span>
          </div>
        </div>
        {extractBagsLinks(message.content).map((url) => (
          <BagsPreview key={url} url={url} />
        ))}
      </div>
    </div>
  );
}
