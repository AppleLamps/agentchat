import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const agent = await authenticateRequest(request);

  if (!agent) {
    return unauthorizedResponse("Invalid or missing API key");
  }

  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          members: true,
          messages: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json({
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      created_at: room.createdAt.toISOString(),
      member_count: room._count.members,
      message_count: room._count.messages,
    })),
  });
}
