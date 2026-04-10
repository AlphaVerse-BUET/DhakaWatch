/**
 * NodiWatch AI Chat API
 * =====================
 * POST /api/ai/chat
 *
 * Conversational AI assistant for environmental monitoring queries.
 * Powered by n8n agent workflows and tool-calling backends.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendChatToN8N } from "@/lib/n8n";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      pageContext = "",
      currentPage = "",
      sessionId = "",
    } = body as {
      message: string;
      history?: ChatMessage[];
      pageContext?: string;
      currentPage?: string;
      sessionId?: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Limit message length
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Maximum: 2000 characters" },
        { status: 400 },
      );
    }

    // Limit conversation history
    const limitedHistory = history.slice(-10);

    const response = await sendChatToN8N({
      message,
      history: limitedHistory,
      pageContext,
      currentPage,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST with JSON body." },
    { status: 405 },
  );
}
