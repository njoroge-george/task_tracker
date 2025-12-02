"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Code, MessageSquare, AlertCircle, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIHelperProps {
  currentCode: {
    html: string;
    css: string;
    js: string;
    python: string;
  };
  activeTab: "html" | "css" | "js" | "py";
  onApplyCode: (code: string, language: string) => void;
}

export default function AIHelper({ currentCode, activeTab, onApplyCode }: AIHelperProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"generate" | "explain" | "fix" | "optimize">("generate");

  const getActiveCode = () => {
    switch (activeTab) {
      case "html":
        return currentCode.html;
      case "css":
        return currentCode.css;
      case "js":
        return currentCode.js;
      case "py":
        return currentCode.python;
      default:
        return "";
    }
  };

  const getLangName = () => {
    switch (activeTab) {
      case "py":
        return "python";
      default:
        return activeTab;
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && mode === "generate") return;

    setLoading(true);
    setResponse("");

    try {
      const code = getActiveCode();
      const language = getLangName();

      let requestBody: any = {
        language,
        mode,
      };

      if (mode === "generate") {
        requestBody.prompt = prompt;
        requestBody.code = code; // For context
      } else {
        requestBody.code = code;
        if (prompt) requestBody.additionalContext = prompt;
      }

      const res = await fetch("/api/code/ai-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok && data?.response) {
        setResponse(data.response);
      } else {
        setResponse(data?.error || "AI request failed");
      }
    } catch (error) {
      setResponse("Failed to connect to AI service");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!response) return;
    
    // Extract code from response (look for code blocks)
    const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    const code = codeBlockMatch ? codeBlockMatch[1] : response;
    
    onApplyCode(code, getLangName());
    setResponse("");
    setPrompt("");
  };

  const quickPrompts = {
    generate: [
      "Create a function to fetch data from an API",
      "Add a loading spinner",
      "Create a responsive navbar",
      "Add form validation",
    ],
    explain: [
      "Explain what this code does",
      "How can I improve this?",
      "What are potential issues?",
    ],
    fix: [
      "Fix any errors in this code",
      "Why isn't this working?",
      "Debug this function",
    ],
    optimize: [
      "Make this code more efficient",
      "Reduce code complexity",
      "Improve performance",
    ],
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">
              <Code className="w-4 h-4 mr-1" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="explain">
              <MessageSquare className="w-4 h-4 mr-1" />
              Explain
            </TabsTrigger>
            <TabsTrigger value="fix">
              <AlertCircle className="w-4 h-4 mr-1" />
              Fix
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <Lightbulb className="w-4 h-4 mr-1" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value={mode} className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {mode === "generate" && "Describe what code you want to generate"}
              {mode === "explain" && "Get an explanation of your current code"}
              {mode === "fix" && "Find and fix errors in your code"}
              {mode === "optimize" && "Improve your code's performance and quality"}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={
                  mode === "generate"
                    ? "Describe what you want to create..."
                    : "Additional context (optional)..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Quick prompts */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Quick prompts:</div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts[mode].map((qp, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    onClick={() => setPrompt(qp)}
                    className="text-xs"
                  >
                    {qp}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || (!prompt.trim() && mode === "generate")}
              className="w-full"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {mode === "generate" && "Generate Code"}
                  {mode === "explain" && "Explain Code"}
                  {mode === "fix" && "Fix Code"}
                  {mode === "optimize" && "Optimize Code"}
                </>
              )}
            </Button>

            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Response:</div>
                  {mode === "generate" && (
                    <Button size="sm" onClick={handleApply}>
                      Apply Code
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {response}
                </div>
              </div>
            )}

            {!getActiveCode() && mode !== "generate" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                No code in the current tab to {mode}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
