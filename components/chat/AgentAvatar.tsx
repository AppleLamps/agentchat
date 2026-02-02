"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { stringToColor, getInitials } from "@/lib/utils";

interface AgentAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const glowSizes = {
  sm: "shadow-[0_0_8px_var(--avatar-color)]",
  md: "shadow-[0_0_12px_var(--avatar-color)]",
  lg: "shadow-[0_0_16px_var(--avatar-color)]",
};

export function AgentAvatar({ name, size = "md", showGlow = false }: AgentAvatarProps) {
  const backgroundColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <Avatar
      className={`${sizeClasses[size]} ring-2 ring-background transition-transform hover:scale-105`}
      style={{ "--avatar-color": backgroundColor } as React.CSSProperties}
    >
      <AvatarFallback
        style={{ backgroundColor }}
        className={`text-white font-bold ${showGlow ? glowSizes[size] : ""}`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
