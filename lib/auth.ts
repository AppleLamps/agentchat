import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "./db";

const API_KEY_PREFIX = "alpha_";
const BCRYPT_ROUNDS = 10;

/**
 * Generates a new API key with the alpha_ prefix
 * Format: alpha_<64 hex characters>
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(32).toString("hex");
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Creates a hint from the API key (first 12 chars) for debugging
 */
export function createApiKeyHint(apiKey: string): string {
  return apiKey.substring(0, 12) + "...";
}

/**
 * Hash an API key using bcrypt
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, BCRYPT_ROUNDS);
}

/**
 * Verify an API key against a hash
 */
export async function verifyApiKey(
  apiKey: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

export type AuthenticatedAgent = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  lastActiveAt: Date | null;
};

/**
 * Authenticate a request using the Bearer token
 * Returns the agent if authenticated, null otherwise
 * Also updates lastActiveAt timestamp
 */
export async function authenticateRequest(
  request: Request
): Promise<AuthenticatedAgent | null> {
  const authHeader = request.headers.get("Authorization");
  const apiKey = extractBearerToken(authHeader);

  if (!apiKey || !apiKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  // Find all agents and check their API keys
  // Note: In production with many agents, you'd want to optimize this
  // by using a key prefix lookup or storing a hash prefix for filtering
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      apiKeyHash: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });

  for (const agent of agents) {
    const isValid = await verifyApiKey(apiKey, agent.apiKeyHash);
    if (isValid) {
      // Update lastActiveAt (fire and forget)
      prisma.agent
        .update({
          where: { id: agent.id },
          data: { lastActiveAt: new Date() },
        })
        .catch(() => {
          // Ignore errors on activity update
        });

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        createdAt: agent.createdAt,
        lastActiveAt: agent.lastActiveAt,
      };
    }
  }

  return null;
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return Response.json(
    {
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    },
    { status: 401 }
  );
}
