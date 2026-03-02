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
    const { title, content, file_path, doc_type, last_modified } = body;

    if (!title || !content || !file_path || !doc_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = await convex.mutation(api.documents.sync, {
      title,
      content,
      file_path,
      doc_type,
      last_modified,
    });

    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
