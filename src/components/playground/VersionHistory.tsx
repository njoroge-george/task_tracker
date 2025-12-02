"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface CodeVersion {
  id: string;
  timestamp: number;
  title: string;
  html: string;
  css: string;
  js: string;
  python?: string;
  message?: string;
}

interface VersionHistoryProps {
  snippetId: string | null;
  currentCode: {
    html: string;
    css: string;
    js: string;
    python: string;
  };
  onRestore: (version: CodeVersion) => void;
}

export default function VersionHistory({ snippetId, currentCode, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Save version to localStorage
  const saveVersion = (message?: string) => {
    const version: CodeVersion = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      title: `Version ${versions.length + 1}`,
      html: currentCode.html,
      css: currentCode.css,
      js: currentCode.js,
      python: currentCode.python,
      message,
    };

    const key = `playground_history_${snippetId || 'temp'}`;
    const updated = [version, ...versions].slice(0, 50); // Keep last 50 versions
    setVersions(updated);
    
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save version history:', error);
    }
  };

  // Load versions from localStorage
  useEffect(() => {
    const key = `playground_history_${snippetId || 'temp'}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVersions(parsed);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  }, [snippetId]);

  // Auto-save versions periodically
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      // Only save if there's actual code
      if (currentCode.html || currentCode.css || currentCode.js || currentCode.python) {
        saveVersion('Auto-saved');
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [currentCode, autoSaveEnabled, snippetId]);

  const deleteVersion = (versionId: string) => {
    const updated = versions.filter(v => v.id !== versionId);
    setVersions(updated);
    
    const key = `playground_history_${snippetId || 'temp'}`;
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  };

  const clearAllVersions = () => {
    if (!confirm('Clear all version history? This cannot be undone.')) return;
    
    setVersions([]);
    const key = `playground_history_${snippetId || 'temp'}`;
    localStorage.removeItem(key);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveVersion('Manual save')}
            >
              Save Version
            </Button>
            {versions.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllVersions}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </span>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            Auto-save
          </label>
        </div>

        <ScrollArea className="h-[400px]">
          {versions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No versions saved yet
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="p-3 border rounded-lg hover:bg-accent-secondary/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{version.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </div>
                      {version.message && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          {version.message}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>HTML: {version.html.length}b</span>
                        <span>CSS: {version.css.length}b</span>
                        <span>JS: {version.js.length}b</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRestore(version)}
                        title="Restore this version"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteVersion(version.id)}
                        title="Delete this version"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
