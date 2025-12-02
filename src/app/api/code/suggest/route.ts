import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { language, code } = body || {};
    if (!language || !code) return NextResponse.json({ error: "Missing language/code" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

    const client = new OpenAI({ apiKey });

    const prompt = `You are an expert ${language.toUpperCase()} coding assistant. Given the user's current code, suggest a short continuation or improvement. Keep it concise and directly usable.\n\nCurrent code:\n\n${code}\n\nSuggestion:`;

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 120,
    });

    const text = resp.output_text?.trim();
    return NextResponse.json({ suggestion: text || "" });
  } catch (e: any) {
    console.error("suggest error", e);
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 });
  }
}
