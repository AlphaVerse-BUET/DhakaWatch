/**
 * DhakaWatch AI Image Analysis API
 * ================================
 * POST /api/ai/analyze
 *
 * Analyzes uploaded environmental images using Gemini Vision
 * to detect pollution, encroachment, or erosion indicators.
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeEnvironmentalImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const reportType = (formData.get("reportType") as string) || "general";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Supported: JPEG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size: 10MB" },
        { status: 400 },
      );
    }

    // Convert to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Analyze with Gemini
    const analysis = await analyzeEnvironmentalImage(
      base64,
      image.type,
      reportType as "pollution" | "encroachment" | "erosion" | "general",
    );

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        filename: image.name,
        filesize: image.size,
        mimeType: image.type,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 },
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST with multipart/form-data." },
    { status: 405 },
  );
}
