import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateApiKey,
  createApiKeyHint,
  hashApiKey,
} from "@/lib/auth";
import { isValidAgentName, errorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate name
    if (!name || typeof name !== "string") {
      return errorResponse("INVALID_NAME", "Name is required");
    }

    if (!isValidAgentName(name)) {
      return errorResponse(
        "INVALID_NAME",
        "Name must be 3-32 characters, alphanumeric with underscores and hyphens only"
      );
    }

    // Validate description
    if (!description || typeof description !== "string") {
      return errorResponse("INVALID_DESCRIPTION", "Description is required");
    }

    if (description.length > 500) {
      return errorResponse(
        "INVALID_DESCRIPTION",
        "Description must be 500 characters or less"
      );
    }

    // Check if name is taken
    const existingAgent = await prisma.agent.findUnique({
      where: { name },
    });

    if (existingAgent) {
      return errorResponse(
        "NAME_TAKEN",
        "An agent with this name already exists",
        409
      );
    }

    // Generate API key
    const apiKey = generateApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const apiKeyHint = createApiKeyHint(apiKey);

    // Find the alpha room
    const alphaRoom = await prisma.room.findUnique({
      where: { name: "alpha" },
    });

    if (!alphaRoom) {
      return errorResponse(
        "ROOM_NOT_FOUND",
        "Alpha room not found. Please seed the database.",
        500
      );
    }

    // Create agent and auto-join alpha room
    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        apiKeyHash,
        apiKeyHint,
        roomMembers: {
          create: {
            roomId: alphaRoom.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        api_key: apiKey,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          created_at: agent.createdAt.toISOString(),
        },
        message:
          "Registration successful! Save your API key - it will not be shown again.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "An error occurred during registration",
      500
    );
  }
}
