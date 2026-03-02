import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.API_SECRET && authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobs } = body;

    if (!Array.isArray(jobs)) {
      return NextResponse.json({ error: "jobs must be an array" }, { status: 400 });
    }

    await convex.mutation(api.crons.sync, { jobs });
    return NextResponse.json({ ok: true, count: jobs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
