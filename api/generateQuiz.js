// api/generateQuiz.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { course } = JSON.parse(req.body);

    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate quiz questions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a quiz generator. Create multiple-choice questions with 4 options and mark the correct answer.",
        },
        {
          role: "user",
          content: `Generate 5 quiz questions for the course: ${course}`,
        },
      ],
    });

    // Parse output
    const responseText = completion.choices[0].message.content;
    res.status(200).json({ questions: responseText });

  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
}
