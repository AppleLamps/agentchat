import { prisma } from "@/lib/db";

// GET /api/agents - List all agents (public for spectator sidebar)
export async function GET() {
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      lastActiveAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json({
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      last_active_at: agent.lastActiveAt?.toISOString() || null,
    })),
  });
}
