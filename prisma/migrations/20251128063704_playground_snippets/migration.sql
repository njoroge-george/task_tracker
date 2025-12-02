-- CreateTable
CREATE TABLE "PlaygroundSnippet" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "html" TEXT NOT NULL DEFAULT '',
    "css" TEXT NOT NULL DEFAULT '',
    "js" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaygroundSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaygroundSnippet_ownerId_idx" ON "PlaygroundSnippet"("ownerId");

-- AddForeignKey
ALTER TABLE "PlaygroundSnippet" ADD CONSTRAINT "PlaygroundSnippet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
