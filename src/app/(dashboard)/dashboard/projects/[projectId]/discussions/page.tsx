"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string | null; image: string | null };
}

interface DiscussionComment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string | null; image: string | null };
}

export default function ProjectDiscussionsPage() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : Array.isArray(params.projectId) ? params.projectId[0] : undefined;
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (projectId) fetchDiscussions();
  }, [projectId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/discussions`);
      const data = await res.json();
      if (res.ok) setDiscussions(data.discussions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const postDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim() || !projectId) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        fetchDiscussions();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to post discussion");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Discussions</h1>
        <p className="text-sm text-secondary mt-1">Threaded discussions for this project.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Discussion</CardTitle>
          <CardDescription>Ask questions, share context, or propose changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your discussion..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end">
            <Button onClick={postDiscussion} disabled={posting || !newTitle.trim() || !newContent.trim()}>
              {posting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Threads</CardTitle>
          <CardDescription>
            {loading ? "Loading discussions..." : discussions.length === 0 ? "No discussions yet" : `${discussions.length} thread(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {discussions.map((d) => (
            <DiscussionItem key={d.id} discussion={d} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DiscussionItem({ discussion }: { discussion: Discussion }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/discussions/${discussion.id}/comments`);
      const data = await res.json();
      if (res.ok) setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggle = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      loadComments();
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/discussions/${discussion.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        await loadComments();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to post comment');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-default bg-primary">
      <h3 className="text-sm font-semibold">{discussion.title}</h3>
      <p className="text-sm text-secondary mt-1 whitespace-pre-wrap">{discussion.content}</p>
      <p className="text-xs text-muted-foreground mt-2">By {discussion.author.name || discussion.author.email} • {new Date(discussion.createdAt).toLocaleString()}</p>
      <div className="mt-3">
        <Button variant="secondary" size="sm" onClick={handleToggle}>
          {showComments ? 'Hide comments' : 'Show comments'}
        </Button>
      </div>
      {showComments && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            {loadingComments ? (
              <p className="text-xs text-muted-foreground">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="rounded-md border border-default bg-background p-2">
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">By {c.author.name || c.author.email} • {new Date(c.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Write a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  postComment();
                }
              }}
            />
            <Button onClick={postComment} disabled={postingComment || !newComment.trim()}>
              {postingComment ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
