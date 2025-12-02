"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal as TerminalIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalLine {
  type: "input" | "output" | "error" | "info";
  content: string;
  timestamp: number;
}

interface TerminalSimulationProps {
  logs: Array<{ type: string; text: string }>;
  onClear: () => void;
}

export default function TerminalSimulation({ logs, onClear }: TerminalSimulationProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert logs to terminal format
  useEffect(() => {
    const newLines: TerminalLine[] = logs.map((log) => ({
      type: log.type === "error" ? "error" : log.type === "warn" ? "error" : "output",
      content: log.text,
      timestamp: Date.now(),
    }));

    setHistory((prev) => [...prev, ...newLines].slice(-500)); // Keep last 500 lines
  }, [logs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const addLine = (type: TerminalLine["type"], content: string) => {
    setHistory((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    // Add command to history
    addLine("input", `$ ${cmd}`);
    setCommandHistory((prev) => [...prev, cmd]);

    // Parse and execute command
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        addLine("info", "Available commands:");
        addLine("info", "  help - Show this help message");
        addLine("info", "  clear - Clear terminal");
        addLine("info", "  echo <text> - Print text");
        addLine("info", "  date - Show current date/time");
        addLine("info", "  calc <expression> - Calculate math expression");
        addLine("info", "  info - Show system info");
        break;

      case "clear":
        setHistory([]);
        break;

      case "echo":
        addLine("output", args.join(" "));
        break;

      case "date":
        addLine("output", new Date().toString());
        break;

      case "calc":
      case "calculate":
        try {
          const expression = args.join(" ");
          // Safe eval for simple math
          const result = Function(`"use strict"; return (${expression})`)();
          addLine("output", `${expression} = ${result}`);
        } catch (e) {
          addLine("error", "Invalid expression");
        }
        break;

      case "info":
      case "sysinfo":
        addLine("info", "System Information:");
        addLine("info", `  Browser: ${navigator.userAgent}`);
        addLine("info", `  Platform: ${navigator.platform}`);
        addLine("info", `  Language: ${navigator.language}`);
        addLine("info", `  Online: ${navigator.onLine}`);
        break;

      case "history":
        commandHistory.forEach((cmd, idx) => {
          addLine("info", `  ${idx + 1}  ${cmd}`);
        });
        break;

      case "whoami":
        addLine("output", "playground-user");
        break;

      case "pwd":
        addLine("output", "/playground");
        break;

      case "ls":
      case "dir":
        addLine("output", "index.html  styles.css  script.js");
        break;

      default:
        addLine("error", `Command not found: ${command}. Type 'help' for available commands.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple autocomplete for commands
      const commands = ["help", "clear", "echo", "date", "calc", "info", "history", "whoami", "pwd", "ls"];
      const matches = commands.filter((cmd) => cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        addLine("info", matches.join("  "));
      }
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5" />
            Terminal
          </div>
          <Button size="sm" variant="ghost" onClick={() => { setHistory([]); onClear(); }}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black text-green-400 font-mono text-sm">
          <div
            ref={terminalRef}
            className="h-[300px] overflow-y-auto p-4 space-y-1"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="text-green-500 mb-2">
              Playground Terminal v1.0.0
              <br />
              Type 'help' for available commands.
            </div>

            {history.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.type === "input"
                    ? "text-white font-bold"
                    : line.type === "error"
                    ? "text-red-400"
                    : line.type === "info"
                    ? "text-blue-400"
                    : "text-green-300"
                }`}
              >
                {line.content}
              </div>
            ))}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-green-500">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-white"
                placeholder="Enter command..."
                autoFocus
              />
            </form>
          </div>
        </div>

        <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>{history.length} lines</span>
          <span>Use ↑↓ for history, Tab for autocomplete</span>
        </div>
      </CardContent>
    </Card>
  );
}
