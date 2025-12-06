"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeMirror from "@uiw/react-codemirror";
import { keymap, EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab, indentLess, indentMore } from "@codemirror/commands";
import { searchKeymap, openSearchPanel, selectNextOccurrence } from "@codemirror/search";
import { foldKeymap } from "@codemirror/language";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { python as pythonLang } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TemplateLibrary, { Template } from "./TemplateLibrary";
import VersionHistory, { CodeVersion } from "./VersionHistory";
import AIHelper from "./AIHelper";
import TerminalSimulation from "./TerminalSimulation";
import { expandEmmet } from "@/lib/emmet";
import { validateAndSanitize, wrapWithTimeout } from "@/lib/playground-security";

type Lang = "html" | "css" | "js" | "py";

export default function LiveEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [html, setHtml] = useState<string>("<div id=\"app\">Hello, world!</div>");
  const [css, setCss] = useState<string>("body{font-family:system-ui;padding:16px}#app{color:#2563eb;font-weight:600}");
  const [js, setJs] = useState<string>("console.log('ready');");
  const [py, setPy] = useState<string>("print('ready')\n");
  const [suggesting, setSuggesting] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Lang>("html");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [snippetId, setSnippetId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [formatOnSave, setFormatOnSave] = useState<boolean>(true);
  const [livePredict, setLivePredict] = useState<boolean>(false);
  const [snippets, setSnippets] = useState<Array<{id:string; title:string|null; isPublic:boolean; createdAt:string; updatedAt:string}>>([]);
  const [loadingSnippet, setLoadingSnippet] = useState<boolean>(false);
  const lastSavedHash = useRef<string>("");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const [showAIHelper, setShowAIHelper] = useState<boolean>(false);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const srcDoc = useMemo(() => {
    // Validate and sanitize code for security
    const validation = validateAndSanitize(html, css, js, py);
    
    // Show validation errors in console
    if (validation.errors.length > 0) {
      validation.errors.forEach(err => {
        setLogs(prev => [...prev, { type: 'error', text: `🔒 Security: ${err}` }]);
      });
    }
    
    // Show validation warnings
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => {
        setLogs(prev => [...prev, { type: 'warn', text: `⚠️ ${warn}` }]);
      });
    }
    
    // Use validated code (or empty if blocked)
    const safeHtml = validation.html;
    const safeCss = validation.css;
    const safeJs = validation.js;
    const safePy = validation.python;
    
    // Wrap JavaScript with timeout protection
    const protectedJs = safeJs ? wrapWithTimeout(safeJs, 5000) : '';
    
    const consolePatch = `
      <script>
        (function(){
          const send = (type, args) => parent.postMessage({ source: 'playground-console', type, args: Array.from(args).map(a=>{
            try { return typeof a==='object' ? JSON.stringify(a) : String(a); } catch(e){ return String(a); }
          }) }, '*');
          const orig = { log: console.log, error: console.error, warn: console.warn };
          console.log = function(){ send('log', arguments); orig.log.apply(console, arguments); };
          console.error = function(){ send('error', arguments); orig.error.apply(console, arguments); };
          console.warn = function(){ send('warn', arguments); orig.warn.apply(console, arguments); };
          window.addEventListener('error', (e)=>{ send('error', [e.message]); });
        })();
      <\/script>`;
    const pyodideLoader = safePy && safePy.trim().length > 0 ? `
      <script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"><\/script>
      <script>
        (async function(){
          try {
            const send = (type, args) => parent.postMessage({ source: 'playground-console', type, args }, '*');
            const pyodide = await loadPyodide();
            pyodide.setStdout({ batched: (s) => send('log', [s]) });
            pyodide.setStderr({ batched: (s) => send('error', [s]) });
            const code = ${JSON.stringify(safePy)};
            // Timeout protection for Python
            const timeout = setTimeout(() => {
              send('error', ['⚠️ TIMEOUT: Python execution stopped after 10s']);
            }, 10000);
            await pyodide.runPythonAsync(code);
            clearTimeout(timeout);
          } catch (e) {
            const msg = (e && e.message) ? e.message : String(e);
            parent.postMessage({ source: 'playground-console', type: 'error', args: [msg] }, '*');
          }
        })();
      <\/script>
    ` : '';
    return `<!doctype html><html><head><meta charset=\"utf-8\"><style>${safeCss}</style></head><body>${safeHtml}${consolePatch}<script>${protectedJs}<\/script>${pyodideLoader}</body></html>`;
  }, [html, css, js, py]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = srcDoc;
    }
  }, [srcDoc]);

  // Load snippet from query if provided
  useEffect(() => {
    const id = searchParams?.get("snippet") ?? null;
    const fork = searchParams?.get("fork") ?? null;
    if (id && id !== "undefined" && id !== "null" && id !== snippetId) {
      void loadSnippet(id, { fork: fork === "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load my snippet list
  useEffect(() => {
    void refreshList();
  }, []);

  const onSuggest = async () => {
    setSuggesting(true);
    setSuggestion("");
    try {
  const code = activeTab === "html" ? html : activeTab === "css" ? css : activeTab === "js" ? js : py;
      const res = await fetch("/api/code/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: activeTab === 'py' ? 'python' : activeTab, code }),
      });
      const data = await res.json();
      if (res.ok && data?.suggestion) setSuggestion(data.suggestion);
      else setSuggestion(data?.error || "No suggestion");
    } catch (e) {
      setSuggestion("Suggestion failed");
    } finally {
      setSuggesting(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    if (activeTab === "html") setHtml((v) => v + "\n" + suggestion);
    if (activeTab === "css") setCss((v) => v + "\n" + suggestion);
    if (activeTab === "js") setJs((v) => v + "\n" + suggestion);
    setSuggestion("");
  };

  const [logs, setLogs] = useState<Array<{type:string; text:string}>>([]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e?.data?.source !== 'playground-console') return;
      const { type, args } = e.data as { type: string; args: string[] };
      setLogs((prev) => [...prev, { type, text: args.join(' ') }].slice(-200));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // ------- CodeMirror keymaps / helpers -------
  function duplicateSelectionOrLine(view: EditorView, above = false) {
    const { state } = view;
    const tr = state.changeByRange(range => {
      const line = state.doc.lineAt(range.head);
      const selText = range.from === range.to ? line.text : state.sliceDoc(range.from, range.to);
      const insertPos = above ? line.from : line.to;
      const insertText = (range.from === range.to ? "\n" : "") + selText + (range.from === range.to ? "" : "");
      const changes = above
        ? { from: line.from, to: line.from, insert: selText + "\n" }
        : { from: line.to, to: line.to, insert: "\n" + selText };
      const head = above ? range.head + selText.length + 1 : range.head + selText.length + 1;
      return { changes, range: EditorSelection.cursor(Math.min(head, state.doc.length)) };
    });
    view.dispatch(tr);
    return true;
  }

  function deleteLine(view: EditorView) {
    const { state } = view;
    const tr = state.changeByRange(range => {
      const line = state.doc.lineAt(range.head);
      const nextFrom = Math.min(line.from, state.doc.length);
      const nextTo = Math.min(line.to + 1, state.doc.length);
      return { changes: { from: nextFrom, to: nextTo, insert: "" }, range: EditorSelection.cursor(Math.min(nextFrom, state.doc.length)) };
    });
    view.dispatch(tr);
    return true;
  }

  function gotoLinePrompt(view: EditorView) {
    const input = window.prompt("Go to line[:col]", "1");
    if (!input) return true;
    const [lnStr, colStr] = input.split(":");
    let line = Math.max(1, parseInt(lnStr || "1", 10) || 1);
    let col = Math.max(1, parseInt(colStr || "1", 10) || 1);
    const { state } = view;
    if (line > state.doc.lines) line = state.doc.lines;
    const lineInfo = state.doc.line(line);
    const pos = Math.min(lineInfo.from + (col - 1), lineInfo.to);
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
    return true;
  }

  function wrapWithTag(view: EditorView) {
    const tag = window.prompt("Wrap selection with tag (e.g., div)", "div");
    if (!tag) return true;
    const { state } = view;
    const tr = state.changeByRange(range => {
      const selected = state.sliceDoc(range.from, range.to) || "";
      const open = `<${tag}>`;
      const close = `</${tag}>`;
      const insert = open + selected + close;
      const from = range.from;
      const to = range.to;
      return { changes: { from, to, insert }, range: EditorSelection.range(from + open.length, from + open.length + selected.length) };
    });
    view.dispatch(tr);
    return true;
  }

  const baseExtensions = [
    history(),
    autocompletion(),
    closeBrackets(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...closeBracketsKeymap,
      // NOTE: Don't add indentWithTab here - it's added per-language to allow Emmet expansion
      { key: "Shift-Tab", run: indentLess },
      { key: "Mod-f", run: openSearchPanel },
      { key: "Mod-d", run: selectNextOccurrence },
      { key: "Mod-g", run: gotoLinePrompt },
      { key: "Mod-Shift-k", run: deleteLine },
      { key: "Shift-Alt-Down", run: (v) => duplicateSelectionOrLine(v, false) },
      { key: "Shift-Alt-Up", run: (v) => duplicateSelectionOrLine(v, true) },
      { key: "Mod-Shift-w", run: wrapWithTag },
      { key: "Mod-Shift-j", run: (v) => { v.dispatch(v.state.replaceSelection("console.log(\"\");")); return true; } },
    ]),
  ];

  function toggleCommentLine(view: EditorView) {
    const { state } = view;
    const tr = state.changeByRange(range => {
      const fromLine = state.doc.lineAt(range.from).number;
      const toLine = state.doc.lineAt(range.to).number;
      let changes: { from: number; to: number; insert: string }[] = [];
      let uncomment = true;
      for (let ln = fromLine; ln <= toLine; ln++) {
        const li = state.doc.line(ln);
        if (!li.text.trimStart().startsWith("//")) { uncomment = false; break; }
      }
      for (let ln = fromLine; ln <= toLine; ln++) {
        const li = state.doc.line(ln);
        if (uncomment) {
          const idx = li.text.indexOf("//");
          if (idx >= 0) changes.push({ from: li.from + idx, to: li.from + idx + 2, insert: "" });
        } else {
          changes.push({ from: li.from, to: li.from, insert: "// " });
        }
      }
      const delta = uncomment ? -2 : 3; // rough cursor shift
      return { changes, range: EditorSelection.cursor(Math.max(0, range.head + delta)) } as any;
    });
    view.dispatch(tr);
    return true;
  }

  function toggleCommentLineWithPrefix(view: EditorView, prefix: string) {
    const { state } = view;
    const tr = state.changeByRange(range => {
      const fromLine = state.doc.lineAt(range.from).number;
      const toLine = state.doc.lineAt(range.to).number;
      let changes: { from: number; to: number; insert: string }[] = [];
      let uncomment = true;
      for (let ln = fromLine; ln <= toLine; ln++) {
        const li = state.doc.line(ln);
        if (!li.text.trimStart().startsWith(prefix)) { uncomment = false; break; }
      }
      for (let ln = fromLine; ln <= toLine; ln++) {
        const li = state.doc.line(ln);
        if (uncomment) {
          const idx = li.text.indexOf(prefix);
          if (idx >= 0) changes.push({ from: li.from + idx, to: li.from + idx + prefix.length, insert: "" });
        } else {
          changes.push({ from: li.from, to: li.from, insert: prefix + " " });
        }
      }
      const delta = uncomment ? -prefix.length : prefix.length + 1;
      return { changes, range: EditorSelection.cursor(Math.max(0, range.head + delta)) } as any;
    });
    view.dispatch(tr);
    return true;
  }

  function toggleCommentBlock(view: EditorView, open: string, close: string) {
    const { state } = view;
    const tr = state.changeByRange(range => {
      const hasSel = range.from !== range.to;
      const from = hasSel ? range.from : state.doc.lineAt(range.head).from;
      const to = hasSel ? range.to : state.doc.lineAt(range.head).to;
      const text = state.sliceDoc(from, to);
      const startsWith = text.trimStart().startsWith(open);
      const endsWith = text.trimEnd().endsWith(close);
      if (startsWith && endsWith) {
        const startIdx = text.indexOf(open);
        const endIdx = text.lastIndexOf(close);
        const ch: any[] = [];
        ch.push({ from: from + startIdx, to: from + startIdx + open.length, insert: "" });
        ch.push({ from: from + endIdx - (open.length), to: from + endIdx + close.length - (open.length), insert: "" });
        return { changes: ch, range: EditorSelection.range(from, to - open.length - close.length) };
      } else {
        return { changes: [{ from, to: from, insert: open }, { from: to, to, insert: close }], range: EditorSelection.range(from + open.length, to + open.length) };
      }
    });
    view.dispatch(tr);
    return true;
  }

  function htmlSkeleton(view: EditorView) {
    const content = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title || "Playground"}</title>
    <style>
      body{font-family:system-ui;margin:0;padding:16px}
    </style>
  </head>
  <body>
    <div id="app">Hello, world!</div>
    <script>
      console.log('ready');
    <\/script>
  </body>
</html>`;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content }, selection: { anchor: content.indexOf("Hello, world!") } });
    return true;
  }

  function cssReset(view: EditorView) {
    const reset = `*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:system-ui}img,svg{display:block;max-width:100%}`;
    view.dispatch(view.state.replaceSelection(reset));
    return true;
  }

  function jsFetch(view: EditorView) {
    const code = `async function getJSON(url){\n  const res = await fetch(url);\n  if(!res.ok) throw new Error('Request failed');\n  return res.json();\n}\n\ngetJSON('https://jsonplaceholder.typicode.com/todos/1').then(console.log).catch(console.error);`;
    view.dispatch(view.state.replaceSelection(code));
    return true;
  }

  const htmlExtensions = [
    ...baseExtensions,
    keymap.of([
      { key: "Mod-Alt-h", run: htmlSkeleton },
      { key: "Mod-/", run: (v) => toggleCommentBlock(v, "<!--", "-->") },
      { key: "Mod-Shift-/", run: (v) => toggleCommentBlock(v, "<!--", "-->") },
      { key: "Tab", run: (v) => {
        // Try Emmet expansion first, fallback to indent
        return expandHtmlAbbreviation(v) || indentMore(v);
      }},
    ]),
  ];
  const cssExtensions = [
    ...baseExtensions,
    keymap.of([
      { key: "Mod-Alt-r", run: cssReset },
      { key: "Mod-/", run: (v) => toggleCommentBlock(v, "/*", "*/") },
      { key: "Mod-Shift-/", run: (v) => toggleCommentBlock(v, "/*", "*/") },
      { key: "Tab", run: (v) => {
        // Try Emmet expansion first, fallback to indent
        return expandCssAbbreviation(v) || indentMore(v);
      }},
    ]),
  ];
  const jsExtensions = [
    ...baseExtensions,
    keymap.of([
      { key: "Mod-Alt-f", run: jsFetch },
      { key: "Mod-/", run: toggleCommentLine },
      { key: "Mod-Shift-/", run: toggleCommentLine },
      { key: "Tab", run: (v) => {
        // Try Emmet expansion first, fallback to indent
        return expandJsAbbreviation(v) || indentMore(v);
      }},
    ]),
  ];

  const pyExtensions = [
    ...baseExtensions,
    keymap.of([
      { key: "Mod-/", run: (v) => toggleCommentLineWithPrefix(v, "#") },
      { key: "Mod-Shift-/", run: (v) => toggleCommentLineWithPrefix(v, "#") },
      { key: "Tab", run: (v) => {
        // Try Emmet expansion first, fallback to indent
        return expandPyAbbreviation(v) || indentMore(v);
      }},
    ]),
  ];

  async function formatCode(lang: Lang, code: string): Promise<string> {
    try {
      const prettier = await import("prettier/standalone");
      const plugins: any[] = [];
      let parser: string = "babel";
      if (lang === "html") {
        const p = await import("prettier/plugins/html");
        plugins.push(p.default);
        parser = "html";
      } else if (lang === "css") {
        const p = await import("prettier/plugins/postcss");
        plugins.push(p.default);
        parser = "css";
      } else {
        const p = await import("prettier/plugins/babel");
        plugins.push(p.default);
        parser = "babel";
      }
      // @ts-ignore
      return (prettier as any).format(code, { parser, plugins, semi: true, singleQuote: true, tabWidth: 2 });
    } catch {
      return code;
    }
  }

  async function formatAllIfEnabled(h: string, c: string, j: string) {
    if (!formatOnSave) return { h, c, j };
    const [fh, fc, fj] = await Promise.all([
      formatCode("html", h),
      formatCode("css", c),
      formatCode("js", j),
    ]);
    setHtml(fh); setCss(fc); setJs(fj);
    return { h: fh, c: fc, j: fj };
  }

  async function refreshList() {
    try {
      const res = await fetch("/api/playground/snippets", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setSnippets(data || []);
    } catch {}
  }

  async function loadSnippet(id: string, opts?: { fork?: boolean }) {
    setLoadingSnippet(true);
    try {
      const res = await fetch(`/api/playground/snippets/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSnippetId(opts?.fork ? null : data.id);
        setTitle((opts?.fork ? (data.title ? `${data.title} (fork)` : "Untitled (fork)") : data.title) || "");
        setIsPublic(Boolean(data.isPublic));
        setHtml(data.html || "");
        setCss(data.css || "");
  setJs(data.js || "");
  setPy(data.python || "");
        // update URL
        const url = new URL(window.location.href);
        url.searchParams.set("snippet", data.id);
        if (opts?.fork) url.searchParams.delete("fork");
        window.history.replaceState({}, "", url.toString());
        // reset saved hash based on loaded content (fork keeps null id so autosave will create new)
        lastSavedHash.current = JSON.stringify({ title: data.title || "", html: data.html || "", css: data.css || "", js: data.js || "", isPublic: !!data.isPublic });
      }
    } finally {
      setLoadingSnippet(false);
    }
  }

  async function onSave(silent?: boolean) {
    setSaving(true);
    try {
  const { h, c, j } = await formatAllIfEnabled(html, css, js);
  const payload = { title, html: h, css: c, js: j, python: py, isPublic };
      const validId = snippetId && snippetId !== "undefined" && snippetId !== "null" && snippetId.length > 10;
      if (!validId) {
        const res = await fetch("/api/playground/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setSnippetId(data.id);
          await refreshList();
          const url = new URL(window.location.href);
          url.searchParams.set("snippet", data.id);
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        const res = await fetch(`/api/playground/snippets/${snippetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) await refreshList();
      }
      setSavedAt(Date.now());
  lastSavedHash.current = JSON.stringify({ title, html: h, css: c, js: j, python: py, isPublic });
    } finally {
      setSaving(false);
    }
  }

  // --------- Emmet-like tiny expansions ---------
  function wordRangeAt(view: EditorView) {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    const text = line.text;
    const idx = pos - line.from;
    let a = idx, b = idx;
    // Include Emmet characters: >, *, +, #, ., :, -, _, numbers, letters
    const isWord = (ch: string) => /[A-Za-z0-9:#._!\-*>+]/.test(ch);
    while (a > 0 && isWord(text[a - 1])) a--;
    while (b < text.length && isWord(text[b])) b++;
    return { from: line.from + a, to: line.from + b, value: text.slice(a, b) };
  }

  function expandHtmlAbbreviation(view: EditorView) {
    const sel = view.state.selection;
    if (!sel.main.empty) return false; // let normal Tab handle selections
    const w = wordRangeAt(view);
    if (!w.value) return false;
    
    // Use the Emmet expansion library
    const expanded = expandEmmet(w.value, 'html');
    if (!expanded) return false;
    
    view.dispatch({ 
      changes: { from: w.from, to: w.to, insert: expanded }, 
      selection: { anchor: w.from + expanded.length } 
    });
    return true;
  }

  function expandCssAbbreviation(view: EditorView) {
    const sel = view.state.selection;
    if (!sel.main.empty) return false;
    const w = wordRangeAt(view);
    if (!w.value) return false;
    
    // Use the Emmet expansion library
    const expanded = expandEmmet(w.value, 'css');
    if (!expanded) return false;
    
    view.dispatch({ 
      changes: { from: w.from, to: w.to, insert: expanded }, 
      selection: { anchor: w.from + expanded.length } 
    });
    return true;
  }

  function expandJsAbbreviation(view: EditorView) {
    const sel = view.state.selection;
    if (!sel.main.empty) return false;
    const w = wordRangeAt(view);
    if (!w.value) return false;
    
    // Use the Emmet expansion library
    const expanded = expandEmmet(w.value, 'js');
    if (!expanded) return false;
    
    view.dispatch({ 
      changes: { from: w.from, to: w.to, insert: expanded }, 
      selection: { anchor: w.from + expanded.length } 
    });
    return true;
  }

  function expandPyAbbreviation(view: EditorView) {
    const sel = view.state.selection;
    if (!sel.main.empty) return false;
    const w = wordRangeAt(view);
    if (!w.value) return false;
    
    // Use the Emmet expansion library
    const expanded = expandEmmet(w.value, 'py');
    if (!expanded) return false;
    
    view.dispatch({ 
      changes: { from: w.from, to: w.to, insert: expanded }, 
      selection: { anchor: w.from + expanded.length } 
    });
    return true;
  }

  async function formatNow() {
    if (activeTab === 'html') {
      setHtml(await formatCode('html', html));
    } else if (activeTab === 'css') {
      setCss(await formatCode('css', css));
    } else if (activeTab === 'js') {
      setJs(await formatCode('js', js));
    } else {
      // Python: no-op for now
    }
  }

  function onNew() {
    setSnippetId(null);
    setTitle("");
    setIsPublic(true);
    setHtml("<div id=\"app\">Hello, world!</div>");
    setCss("body{font-family:system-ui;padding:16px}#app{color:#2563eb;font-weight:600}");
    setJs("console.log('ready');");
    setPy("print('ready')\n");
    const url = new URL(window.location.href);
    url.searchParams.delete("snippet");
    window.history.replaceState({}, "", url.toString());
  }

  async function onDelete() {
    if (!snippetId) return;
    if (!confirm("Delete this snippet?")) return;
    const res = await fetch(`/api/playground/snippets/${snippetId}`, { method: "DELETE" });
    if (res.ok) {
      onNew();
      await refreshList();
    }
  }

  async function onShare() {
    if (!snippetId) {
      await onSave(true);
    }
    const id = snippetId || new URL(window.location.href).searchParams.get("snippet");
    if (!id) return;
    const url = `${window.location.origin}/playground/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      if (!isPublic) {
        alert("Link copied. Note: this snippet is Private; others won't be able to view it until you toggle Public.");
      } else {
        alert("Share link copied to clipboard");
      }
    } catch {
      prompt("Copy link:", url);
    }
  }

  const handleTemplateSelect = (template: Template) => {
    if (template.html) setHtml(template.html);
    if (template.css) setCss(template.css);
    if (template.js) setJs(template.js);
    if (template.python) setPy(template.python);
    setShowTemplates(false);
  };

  const handleRestoreVersion = (version: CodeVersion) => {
    if (!confirm('Restore this version? Current changes will be lost.')) return;
    setHtml(version.html);
    setCss(version.css);
    setJs(version.js);
    setPy(version.python || '');
    setShowVersionHistory(false);
  };

  const handleApplyAICode = (code: string, language: string) => {
    if (language === 'html') setHtml(code);
    else if (language === 'css') setCss(code);
    else if (language === 'js' || language === 'javascript') setJs(code);
    else if (language === 'python' || language === 'py') setPy(code);
  };

  // Auto-save when snippet exists and content changed (debounced)
  useEffect(() => {
    if (!snippetId) return; // only autosave edits to existing snippets
  const current = JSON.stringify({ title, html, css, js, python: py, isPublic });
    if (current === lastSavedHash.current) return;
    const t = setTimeout(() => {
      void onSave(true);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, html, css, js, py, isPublic, snippetId]);

  // Keyboard shortcut: Ctrl/Cmd+S and apply suggestion (Mod+Shift+Enter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void onSave(true);
      }
      if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        applySuggestion();
      }
      // Open shortcuts/help overlay: Mod+Shift+H
      if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && (e.key.toLowerCase() === "h")) {
        e.preventDefault();
        setShowHelp(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, html, css, js, py, isPublic, snippetId, suggestion]);

  // Live predictions: debounce active tab content
  useEffect(() => {
    if (!livePredict) return;
    const t = setTimeout(() => { void onSuggest(); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePredict, activeTab, html, css, js, py]);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Title and Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Untitled snippet" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public" className="text-sm">Public</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="format-on-save" checked={formatOnSave} onCheckedChange={setFormatOnSave} />
                <Label htmlFor="format-on-save" className="text-sm">Format on Save</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="live-predict" checked={livePredict} onCheckedChange={setLivePredict} />
                <Label htmlFor="live-predict" className="text-sm">Live predictions</Label>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={onNew}>New</Button>
              <Button size="sm" onClick={() => onSave()} disabled={saving || loadingSnippet}>
                {saving ? "Saving…" : (snippetId ? "Save" : "Save As")}
              </Button>
              <Button size="sm" variant="outline" onClick={formatNow}>Format</Button>
              <Button size="sm" variant="outline" onClick={onShare} disabled={loadingSnippet}>Share</Button>
              {snippetId && <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>}
            </div>
            
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
                📚 Templates
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAIHelper(true)}>
                🤖 AI Helper
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowVersionHistory(true)}>
                📜 History
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowTerminal(true)}>
                💻 Terminal
              </Button>
            </div>

            <div className="flex-1" />
            
            <span className="text-xs text-muted-foreground self-center whitespace-nowrap">
              {saving ? "Saving…" : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : ""}
            </span>
          </div>

          {/* My Snippets Section */}
          <div className="border-t pt-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">My Snippets</div>
            <div className="max-h-32 overflow-auto border rounded bg-muted/20">
              {snippets.length === 0 ? (
                <div className="text-xs p-3 text-center text-muted-foreground">No snippets yet</div>
              ) : (
                <ul className="text-sm divide-y">
                  {snippets.map((s) => (
                    <li 
                      key={s.id} 
                      className="flex items-center justify-between px-3 py-2 hover:bg-accent/10 cursor-pointer transition-colors" 
                      onClick={()=>loadSnippet(s.id)}
                    >
                      <span className="truncate font-medium">{s.title || "Untitled"}</span>
                      <span className="text-[10px] uppercase opacity-60 ml-2">
                        {s.isPublic ? "Public" : "Private"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[600px]">
        <Card className="h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b bg-muted/30">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Lang)}>
              <TabsList className="h-9">
                <TabsTrigger value="html" className="text-xs px-3">HTML</TabsTrigger>
                <TabsTrigger value="css" className="text-xs px-3">CSS</TabsTrigger>
                <TabsTrigger value="js" className="text-xs px-3">JS</TabsTrigger>
                <TabsTrigger value="py" className="text-xs px-3">Python</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 items-center flex-wrap">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={onSuggest} 
                disabled={suggesting}
                className="h-8 px-3 text-xs"
              >
                {suggesting ? (
                  <>
                    <span className="mr-1">⚡</span>
                    Suggesting…
                  </>
                ) : (
                  <>
                    <span className="mr-1">💡</span>
                    Suggest
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                onClick={applySuggestion} 
                disabled={!suggestion}
                className="h-8 px-3 text-xs"
              >
                <span className="mr-1">✓</span>
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                title="Keyboard Shortcuts (Mod+Shift+H)" 
                onClick={() => setShowHelp(true)}
                className="h-8 w-8 p-0"
              >
                ?
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {activeTab === "html" && (
                <div className="flex-1 overflow-hidden">
                  <CodeMirror
                    value={html}
                    height="100%"
                    theme={oneDark}
                    extensions={[htmlLang(), ...htmlExtensions]}
                    onChange={(v) => setHtml(v)}
                  />
                </div>
              )}
              {activeTab === "css" && (
                <div className="flex-1 overflow-hidden">
                  <CodeMirror
                    value={css}
                    height="100%"
                    theme={oneDark}
                    extensions={[cssLang(), ...cssExtensions]}
                    onChange={(v) => setCss(v)}
                  />
                </div>
              )}
              {activeTab === "js" && (
                <div className="flex-1 overflow-hidden">
                  <CodeMirror
                    value={js}
                    height="100%"
                    theme={oneDark}
                    extensions={[javascript({ jsx: true }), ...jsExtensions]}
                    onChange={(v) => setJs(v)}
                  />
                </div>
              )}
              {activeTab === "py" && (
                <div className="flex-1 overflow-hidden">
                  <CodeMirror
                    value={py}
                    height="100%"
                    theme={oneDark}
                    extensions={[pythonLang(), ...pyExtensions]}
                    onChange={(v) => setPy(v)}
                  />
                </div>
              )}
              {suggestion && (
                <div className="p-3 bg-muted border-t">
                  <div className="text-xs font-medium mb-1">AI Suggestion:</div>
                  <pre className="text-xs p-2 border rounded bg-background whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {suggestion}
                  </pre>
                </div>
              )}
              {activeTab === "py" && (
                <div className="px-3 py-2 text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 border-t">
                  Python runs in the preview via Pyodide. Some packages may be unavailable.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full xl:col-span-2 flex flex-col">
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Preview & Console</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setLogs([])}
                className="h-7 px-2 text-xs"
              >
                Clear Console
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 p-0 grid grid-rows-2 overflow-hidden">
            <div className="border-b overflow-hidden">
              <iframe ref={iframeRef} className="w-full h-full" title="Preview" />
            </div>
            <div className="w-full h-full p-3 overflow-auto bg-black text-white text-xs font-mono">
              {logs.length === 0 ? (
                <div className="opacity-60">Console output will appear here…</div>
              ) : (
                logs.map((l, i) => (
                  <div 
                    key={i} 
                    className={`mb-1 ${
                      l.type === 'error' 
                        ? 'text-red-400' 
                        : l.type === 'warn' 
                        ? 'text-yellow-300' 
                        : 'text-green-300'
                    }`}
                  >
                    {l.text}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortcuts / Help overlay */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editor shortcuts & tips</DialogTitle>
            <DialogDescription>
              Quick reference for keybindings, abbreviations, and productivity features. Open anytime with Mod+Shift+H.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium mb-1">Global</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Save: Mod+S</li>
                <li>Apply AI suggestion: Mod+Shift+Enter</li>
                <li>Open this help: Mod+Shift+H</li>
                <li>Format current tab: Format button (toggle "Format on Save" to format on save)</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1">Editing</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Search: Mod+F</li>
                <li>Select next occurrence: Mod+D</li>
                <li>Go to line: Mod+G</li>
                <li>Duplicate line/selection: Shift+Alt+Down / Shift+Alt+Up</li>
                <li>Delete line: Mod+Shift+K</li>
                <li>Toggle line comment (JS/Python): Mod+/</li>
                <li>Toggle block comment (HTML/CSS): Mod+/ or Mod+Shift+/</li>
                <li>Wrap with tag (HTML): Mod+Shift+W</li>
                <li>Insert console.log snippet (JS): Mod+Shift+J</li>
                <li>Tab expansions: Press Tab on an abbreviation; Tab falls back to indent when no match</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-1">HTML abbreviations</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>! → HTML skeleton</li>
                  <li>link:css → Stylesheet link</li>
                  <li>script:defer → Defer script tag</li>
                  <li>btn → Button element</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">CSS abbreviations</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>df / dg → display: flex / grid</li>
                  <li>jcc / aic → justify-content: center / align-items: center</li>
                  <li>g10 → gap: 10px</li>
                  <li>p&#123;n&#125; / m&#123;n&#125; / w&#123;n&#125; / h&#123;n&#125; → padding / margin / width / height in px</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">JS abbreviations</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>cl → console.log</li>
                  <li>fn / afn → function / arrow function</li>
                  <li>try → try/catch</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Python abbreviations</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>pr → print</li>
                  <li>def → function stub</li>
                  <li>ifmain → if __name__ == "__main__":</li>
                  <li>imp → import</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">AI & Preview</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Get Suggestion fetches an AI hint for the active tab; Apply inserts it.</li>
                <li>Enable Live predictions to auto-request suggestions while you type.</li>
                <li>Python runs via Pyodide in the preview; some packages may be unavailable.</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Library Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Library</DialogTitle>
            <DialogDescription>
              Choose from ready-to-use templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          <TemplateLibrary onSelect={handleTemplateSelect} />
        </DialogContent>
      </Dialog>

      {/* AI Helper Dialog */}
      <Dialog open={showAIHelper} onOpenChange={setShowAIHelper}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AIHelper
            currentCode={{ html, css, js, python: py }}
            activeTab={activeTab}
            onApplyCode={handleApplyAICode}
          />
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <VersionHistory
            snippetId={snippetId}
            currentCode={{ html, css, js, python: py }}
            onRestore={handleRestoreVersion}
          />
        </DialogContent>
      </Dialog>

      {/* Terminal Dialog */}
      <Dialog open={showTerminal} onOpenChange={setShowTerminal}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <TerminalSimulation
            logs={logs}
            onClear={() => setLogs([])}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
