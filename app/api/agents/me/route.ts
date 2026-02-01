import { NextRequest } from "next/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const agent = await authenticateRequest(request);

  if (!agent) {
    return unauthorizedResponse("Invalid or missing API key");
  }

  return Response.json({
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      created_at: agent.createdAt.toISOString(),
      last_active_at: agent.lastActiveAt?.toISOString() || null,
    },
  });
}
