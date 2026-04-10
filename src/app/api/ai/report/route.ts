/**
 * DhakaWatch Report Generation API
 * =================================
 * POST /api/ai/report
 *
 * Generates formal evidence report summaries for regulatory submission.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateReportSummary } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, location, date, analysis, severity, detectedIssues } = body;

    if (!type || !location || !analysis) {
      return NextResponse.json(
        { error: "Missing required fields: type, location, analysis" },
        { status: 400 },
      );
    }

    const summary = await generateReportSummary({
      type,
      location,
      date: date || new Date().toISOString(),
      analysis,
      severity: severity || "medium",
      detectedIssues: detectedIssues || [],
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Report generation failed",
      },
      { status: 500 },
    );
  }
}
