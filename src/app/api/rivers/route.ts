import { NextResponse } from "next/server";

import { buildRiversResponse } from "@/lib/backend-parity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(buildRiversResponse());
}
