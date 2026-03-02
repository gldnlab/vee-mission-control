import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // Simple API key auth
  const authHeader = req.headers.get("authorization");
  if (process.env.API_SECRET && authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action_type, title, description, metadata, status, session_id, timestamp } = body;

    if (!action_type || !title || !status) {
      return NextResponse.json({ error: "Missing required fields: action_type, title, status" }, { status: 400 });
    }

    const id = await convex.mutation(api.activity.log, {
      action_type,
      title,
      description,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      status,
      session_id,
      timestamp,
    });

    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
