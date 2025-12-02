import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveId(req: NextRequest, rawParams?: any): Promise<string | null> {
  try {
    let params = rawParams;
    if (params && typeof params.then === "function") {
      params = await params;
    }
    let id = params?.id as string | undefined;
    if (!id) {
      // Fallback: pull last segment from URL path
      const pathname = new URL(req.url).pathname;
      const parts = pathname.split("/").filter(Boolean);
      id = parts[parts.length - 1];
    }
    if (typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
    return trimmed;
  } catch {
    return null;
  }
}

// GET /api/playground/snippets/[id] - fetch one snippet if owner or public
export async function GET(_req: NextRequest, context: { params: any }) {
  const session = await auth();
  const id = await resolveId(_req, context?.params);
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!(prisma as any).playgroundSnippet) {
    console.error("Prisma client missing 'playgroundSnippet' delegate. Try: npx prisma generate and restart dev server.");
    return NextResponse.json({ error: "Server not ready. Please retry in a moment." }, { status: 500 });
  }
  const snippet = await prisma.playgroundSnippet.findUnique({ where: { id } });
  if (!snippet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!snippet.isPublic && snippet.ownerId !== session?.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(snippet);
}

// PATCH /api/playground/snippets/[id] - update snippet (owner only)
export async function PATCH(req: NextRequest, context: { params: any }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await resolveId(req, context?.params);
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!(prisma as any).playgroundSnippet) {
    console.error("Prisma client missing 'playgroundSnippet' delegate. Try: npx prisma generate and restart dev server.");
    return NextResponse.json({ error: "Server not ready. Please retry in a moment." }, { status: 500 });
  }

  const exists = await prisma.playgroundSnippet.findUnique({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (exists.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { title, html, css, js, python, isPublic } = await req.json();
    const data: any = {
      title: typeof title === "string" ? title.slice(0, 120) : undefined,
      html,
      css,
      js,
      isPublic,
    };
    if (typeof python === 'string') data.python = python;
    const updated = await prisma.playgroundSnippet.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("update snippet error", e);
    return NextResponse.json({ error: "Failed to update snippet" }, { status: 500 });
  }
}

// DELETE /api/playground/snippets/[id] - delete snippet (owner only)
export async function DELETE(_req: NextRequest, context: { params: any }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await resolveId(_req, context?.params);
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!(prisma as any).playgroundSnippet) {
    console.error("Prisma client missing 'playgroundSnippet' delegate. Try: npx prisma generate and restart dev server.");
    return NextResponse.json({ error: "Server not ready. Please retry in a moment." }, { status: 500 });
  }
  const exists = await prisma.playgroundSnippet.findUnique({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (exists.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.playgroundSnippet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
