"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { stringToColor, getInitials } from "@/lib/utils";

interface AgentAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function AgentAvatar({ name, size = "md" }: AgentAvatarProps) {
  const backgroundColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback
        style={{ backgroundColor }}
        className="text-white font-medium"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
