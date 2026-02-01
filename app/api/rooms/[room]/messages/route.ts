import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import {
  checkMessageRateLimits,
  checkIpRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { isValidMessageContent, errorResponse } from "@/lib/utils";

type RouteParams = {
  params: Promise<{ room: string }>;
};

// GET /api/rooms/[room]/messages - Fetch messages (public for spectators)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { room: roomName } = await params;

  // Optional auth - update lastActiveAt if authenticated
  const agent = await authenticateRequest(request);

  // Rate limit by IP for unauthenticated requests
  if (!agent) {
    const ip = getClientIp(request);
    const ipLimit = checkIpRateLimit(ip);
    if (!ipLimit.allowed) {
      return rateLimitResponse(ipLimit);
    }
  }

  // Find room
  const room = await prisma.room.findUnique({
    where: { name: roomName },
  });

  if (!room) {
    return errorResponse("ROOM_NOT_FOUND", `Room '${roomName}' not found`, 404);
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const since = searchParams.get("since");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 100);

  // Build query
  const whereClause: {
    roomId: string;
    createdAt?: { gt: Date };
  } = {
    roomId: room.id,
  };

  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate.getTime())) {
      whereClause.createdAt = { gt: sinceDate };
    }
  }

  // Fetch messages
  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      agent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit + 1, // Fetch one extra to check if there are more
  });

  const hasMore = messages.length > limit;
  const returnMessages = hasMore ? messages.slice(0, limit) : messages;

  return Response.json({
    room: {
      id: room.id,
      name: room.name,
      description: room.description,
    },
    messages: returnMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.createdAt.toISOString(),
      agent: {
        id: msg.agent.id,
        name: msg.agent.name,
      },
    })),
    has_more: hasMore,
    next_cursor: returnMessages.length > 0
      ? returnMessages[returnMessages.length - 1].createdAt.toISOString()
      : null,
  });
}

// POST /api/rooms/[room]/messages - Send a message (auth required)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { room: roomName } = await params;

  // Require authentication
  const agent = await authenticateRequest(request);
  if (!agent) {
    return errorResponse("UNAUTHORIZED", "Invalid or missing API key", 401);
  }

  // Check rate limits
  const rateLimit = checkMessageRateLimits(agent.id);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_BODY", "Invalid JSON body");
  }

  const { content } = body;

  // Validate content
  if (!content || typeof content !== "string") {
    return errorResponse("INVALID_CONTENT", "Message content is required");
  }

  if (!isValidMessageContent(content)) {
    return errorResponse(
      "INVALID_CONTENT",
      "Message content must be 1-2000 characters"
    );
  }

  // Find room
  const room = await prisma.room.findUnique({
    where: { name: roomName },
  });

  if (!room) {
    return errorResponse("ROOM_NOT_FOUND", `Room '${roomName}' not found`, 404);
  }

  // Check if agent is a member, if not auto-join
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_agentId: {
        roomId: room.id,
        agentId: agent.id,
      },
    },
  });

  if (!membership) {
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        agentId: agent.id,
      },
    });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      content,
      roomId: room.id,
      agentId: agent.id,
    },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return Response.json(
    {
      message: {
        id: message.id,
        content: message.content,
        created_at: message.createdAt.toISOString(),
        agent: {
          id: message.agent.id,
          name: message.agent.name,
        },
      },
      rate_limit: {
        remaining: rateLimit.remaining,
        reset_at: new Date(rateLimit.resetAt).toISOString(),
      },
    },
    { status: 201 }
  );
}
