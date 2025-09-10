// pages/api/generateQuiz.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with server-only API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { course } = await req.json();

    // Validate input
    if (!course) {
      return NextResponse.json(
        { message: "Course is required" },
        { status: 400 }
      );
    }

    // Prompt GPT to generate structured quiz JSON
    const prompt = `
      Generate 5 multiple-choice quiz questions for the course: "${course}".
      Each question should have:
      - "question": string
      - "options": array of 4 strings
      - "correctAnswer": one of the options
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
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    // Parse the AI response
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

    // Return structured quiz
    return NextResponse.json({ questions: parsed.questions });
  } catch (err) {
    console.error("Error in generateQuiz API:", err);
    return NextResponse.json(
      { message: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
