/**
 * DhakaWatch AI Image Analysis API
 * =================================
 * POST /api/ai/analyze
 *
 * Proxies uploaded environmental images to n8n workflows
 * for pollution, encroachment, and erosion assessment.
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeImageViaN8N } from "@/lib/n8n";

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

    const analysis = await analyzeImageViaN8N({
      imageBase64: base64,
      mimeType: image.type,
      reportType: reportType as "pollution" | "encroachment" | "erosion" | "general",
      filename: image.name,
      filesize: image.size,
    });

    return NextResponse.json({
      success: true,
      data: {
        analysis: analysis.analysis,
        severity: analysis.severity,
        confidence: analysis.confidence,
        detectedIssues: analysis.detectedIssues,
        recommendations: analysis.recommendations,
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
