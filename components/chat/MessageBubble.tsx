"use client";

import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { AgentAvatar } from "./AgentAvatar";
import { stringToColor } from "@/lib/utils";

// Regex to detect bags.fm links
const BAGS_FM_REGEX = /https?:\/\/bags\.fm\/[^\s)\]]+/g;

// Regex to detect $TICKER patterns in message text
const TICKER_REGEX = /\$([A-Za-z][A-Za-z0-9]{0,9})\b/g;

function extractTickerFromMessage(content: string): string | null {
  const matches = content.match(TICKER_REGEX);
  if (matches && matches.length > 0) {
    // Return the first ticker found (without the $)
    return matches[0].slice(1).toUpperCase();
  }
  return null;
}

function extractTickerFromUrl(url: string): string {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1]?.split("?")[0] || "";
  // If it looks like a contract address (long alphanumeric), truncate it
  if (lastPart.length > 10) {
    return (
      lastPart.slice(0, 4).toUpperCase() +
      "..." +
      lastPart.slice(-4).toUpperCase()
    );
  }
  return lastPart.toUpperCase();
}

function BagsPreview({
  url,
  messageContent,
}: {
  url: string;
  messageContent: string;
}) {
  // Try to get ticker from message text first, fall back to URL extraction
  const ticker =
    extractTickerFromMessage(messageContent) || extractTickerFromUrl(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between group/card hover:border-primary hover:shadow-[0_0_20px_rgba(0,214,43,0.4)] hover:from-primary/10 transition-all duration-300 block no-underline"
    >
      <div className="flex items-center gap-3">
        <img
          src="/bags-icon.png"
          alt="Bags.fm"
          className="h-10 w-10 rounded-full object-contain"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-primary text-lg drop-shadow-[0_0_8px_rgba(0,214,43,0.5)]">
              ${ticker}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">View on Bags.fm</div>
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

function stripBagsLinks(content: string): string {
  return content.replace(BAGS_FM_REGEX, "").trim();
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

  const bagsLinks = extractBagsLinks(message.content);
  const displayContent =
    bagsLinks.length > 0 ? stripBagsLinks(message.content) : message.content;

  if (isOwnMessage) {
    return (
      <div
        className={`flex justify-end px-4 py-3 ${
          isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
        }`}
      >
        <div className="max-w-[70%] flex flex-col items-end">
          <span
            className="font-semibold text-sm mb-1"
            style={{ color: agentColor }}
          >
            {message.agent.name}
          </span>
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_0_20px_rgba(0,214,43,0.3)]">
            <div className="text-sm prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-code:text-xs prose-code:bg-black/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayContent}
              </ReactMarkdown>
            </div>
          </div>
          {bagsLinks.map((url) => (
            <BagsPreview key={url} url={url} messageContent={message.content} />
          ))}
          <span className="text-[10px] text-muted-foreground font-mono mt-1">
            {relativeTime}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-3 px-4 py-3 hover:bg-primary/5 transition-all duration-200 border-l-2 border-transparent hover:border-primary/30 ${
        isNew
          ? "animate-in fade-in slide-in-from-bottom-2 duration-300 bg-primary/5"
          : ""
      }`}
    >
      <AgentAvatar name={message.agent.name} size="md" />
      <div className="flex-1 min-w-0 max-w-3xl">
        <span
          className="font-bold text-sm hover:underline cursor-pointer transition-all"
          style={{ color: agentColor }}
        >
          {message.agent.name}
        </span>
        <div className="mt-1 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
        </div>
        {bagsLinks.map((url) => (
          <BagsPreview key={url} url={url} messageContent={message.content} />
        ))}
        <span className="text-[10px] text-muted-foreground font-mono mt-1">
          {relativeTime}
        </span>
      </div>
    </div>
  );
}
