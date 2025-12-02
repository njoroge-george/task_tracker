import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/playground/snippets - create a snippet
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!(prisma as any).playgroundSnippet) {
      console.error("Prisma client missing 'playgroundSnippet' delegate. Try: npx prisma generate and restart dev server.");
      return NextResponse.json({ error: "Server not ready. Please retry in a moment." }, { status: 500 });
    }
    const { title, html, css, js, python, isPublic } = await req.json();
    const data: any = {
      title: title?.slice(0, 120) || null,
      html: html ?? "",
      css: css ?? "",
      js: js ?? "",
      isPublic: isPublic ?? true,
      ownerId: session.user.id,
    };
    // Include python if schema is migrated; ignore otherwise
    if (typeof python === 'string') data.python = python;
    const snippet = await prisma.playgroundSnippet.create({
      data,
      select: { id: true, title: true, isPublic: true, createdAt: true },
    });
    return NextResponse.json(snippet, { status: 201 });
  } catch (e) {
    console.error("create snippet error", e);
    return NextResponse.json({ error: "Failed to save snippet" }, { status: 500 });
  }
}

// GET /api/playground/snippets - list current user's snippets (simple list)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(prisma as any).playgroundSnippet) {
    console.error("Prisma client missing 'playgroundSnippet' delegate. Try: npx prisma generate and restart dev server.");
    return NextResponse.json({ error: "Server not ready. Please retry in a moment." }, { status: 500 });
  }
  const snippets = await prisma.playgroundSnippet.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, isPublic: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(snippets);
}
