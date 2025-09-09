import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set in .env.local
});

export async function POST(req) {
  try {
    const { course } = await req.json();

    if (!course) {
      return NextResponse.json(
        { message: "Course is required" },
        { status: 400 }
      );
    }

    // Ask GPT to generate a quiz
    const prompt = `
      Generate 5 multiple-choice quiz questions for the course: "${course}".
      Each question should have:
      - a "question" string
      - 4 "options" (A-D)
      - a "correctAnswer" indicating the correct option letter.

      Return ONLY valid JSON in this format:
      {
        "questions": [
          {
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A"
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // small + cheap, good for structured output
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    // Parse JSON safely
    const text = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("OpenAI response parse error:", e, text);
      return NextResponse.json(
        { message: "Invalid quiz format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (err) {
    console.error("Error in generateQuiz API:", err);
    return NextResponse.json(
      { message: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
