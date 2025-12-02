import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PublicSnippetPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const id = params.id;
  const snippet = await prisma.playgroundSnippet.findUnique({ where: { id } });
  if (!snippet) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold">Snippet not found</h1>
        <p className="text-secondary mt-2">The snippet you are looking for does not exist.</p>
      </div>
    );
  }
  const canView = snippet.isPublic || snippet.ownerId === session?.user?.id;
  if (!canView) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold">This snippet is private</h1>
        <p className="text-secondary mt-2">Ask the owner to make it public or share with you.</p>
      </div>
    );
  }

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>${snippet.css}</style></head><body>${snippet.html}<script>${snippet.js}<\/script></body></html>`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{snippet.title || "Untitled snippet"}</h1>
          <p className="text-sm text-secondary mt-1">{snippet.isPublic ? "Public" : "Private"} • {new Date(snippet.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/playground?snippet=${snippet.id}`} className="px-4 py-2 rounded bg-primary text-white">Open in editor</Link>
          <Link href={`/dashboard/playground?snippet=${snippet.id}&fork=1`} className="px-4 py-2 rounded bg-secondary text-white">Fork</Link>
        </div>
      </div>
      <div className="border rounded overflow-hidden">
        <iframe srcDoc={srcDoc} className="w-full h-[70vh]" title="Preview" />
      </div>
    </div>
  );
}
