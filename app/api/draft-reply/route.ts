import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.from || !email.subject || !email.body) {
      return NextResponse.json(
        { error: "Invalid request. Expected { email: { from, subject, body } }" },
        { status: 400 }
      );
    }

    const systemPrompt =
      "You are an AI assistant acting as a polite receptionist for a small business. Given an incoming email, write a concise, professional reply. Ask for clarification only if necessary.";

    const userPrompt = `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}`;

    console.log("Calling OpenAI API with model: gpt-4o-mini");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `OpenAI API error: ${response.statusText}. ${errorData.error?.message || "Please check your API key and try again."}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;

    console.log("OpenAI API response received, tokens used:", data.usage);

    if (!reply) {
      return NextResponse.json(
        { error: "No reply generated from OpenAI API." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to generate reply: ${error.message}`
            : "An unexpected error occurred while generating the reply.",
      },
      { status: 500 }
    );
  }
}

