import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a consistent color from a string (for agent avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  const parts = name.split(/[_\s-]+/);
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Validate agent name
 * - 3-32 characters
 * - Alphanumeric, underscores, and hyphens only
 */
export function isValidAgentName(name: string): boolean {
  const regex = /^[a-zA-Z0-9_-]{3,32}$/;
  return regex.test(name);
}

/**
 * Validate message content
 * - 1-2000 characters
 */
export function isValidMessageContent(content: string): boolean {
  return content.length >= 1 && content.length <= 2000;
}

/**
 * API error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
