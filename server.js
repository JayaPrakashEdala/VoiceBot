const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error(
    "❌ OPENAI_API_KEY is missing. Please set it in your .env file."
  );
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Custom answers
const customAnswers = {
  "life story":
    "I’m someone who’s deeply curious and passionate about technology and communication. Over the years, I’ve embraced learning as a lifelong journey—constantly exploring new skills and perspectives. This mindset has helped me adapt quickly and collaborate effectively with diverse teams to solve challenging problems.",

  superpower:
    "My #1 superpower is my ability to listen actively and empathize with others. This helps me understand people’s needs deeply, build trust, and find solutions that truly make a difference.",

  "top 3 areas":
    "The top three areas I’d like to grow in are: 1. Leadership – to inspire and guide teams more effectively, 2. Technical mastery – to deepen my expertise in AI and software development, and 3. Public speaking – improving confidence and clarity, especially in larger settings.",

  misconception:
    "Sometimes coworkers think I’m reserved or quiet because I listen more than I speak. But in reality, I’m very engaged and thoughtful—I just prefer to observe carefully before contributing.",

  boundaries:
    "I push myself by seeking projects that challenge my comfort zone, learning from feedback without defensiveness, and setting incremental goals that stretch my skills gradually but consistently.",
};

// Utility function for better matching
const matchesAny = (text, patterns) => patterns.some((p) => text.includes(p));

app.post("/api/chat", async (req, res) => {
  const userPrompt = (req.body.prompt || "").toLowerCase();
  console.log("🟡 Prompt received:", userPrompt);

  try {
    if (
      matchesAny(userPrompt, [
        "life story",
        "your story",
        "tell me about yourself",
      ])
    ) {
      console.log("✅ Matched: Life Story");
      return res.json({ reply: customAnswers["life story"] });
    }

    if (matchesAny(userPrompt, ["superpower", "strength", "best skill"])) {
      console.log("✅ Matched: Superpower");
      return res.json({ reply: customAnswers["superpower"] });
    }

    if (
      matchesAny(userPrompt, [
        "top 3 areas",
        "top three areas",
        "three areas",
        "areas you'd like to grow",
        "areas you want to grow",
        "areas of growth",
      ]) ||
      (userPrompt.includes("grow") && userPrompt.includes("areas")) ||
      (userPrompt.includes("improve") && userPrompt.includes("areas"))
    ) {
      console.log("✅ Matched: Top 3 Areas");
      return res.json({ reply: customAnswers["top 3 areas"] });
    }

    if (
      matchesAny(userPrompt, ["misconception", "wrong idea", "coworkers think"])
    ) {
      console.log("✅ Matched: Misconception");
      return res.json({ reply: customAnswers["misconception"] });
    }

    if (
      matchesAny(userPrompt, [
        "push boundaries",
        "challenge myself",
        "out of comfort zone",
        "limits",
        "boundaries",
      ])
    ) {
      console.log("✅ Matched: Boundaries");
      return res.json({ reply: customAnswers["boundaries"] });
    }

    // Fallback to OpenAI
    console.log("🔄 No custom match. Sending to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI voicebot representing the user in a job interview. Respond warmly, thoughtfully, and concisely.`,
        },
        {
          role: "user",
          content: req.body.prompt,
        },
      ],
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;
    console.log("✅ OpenAI Response:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    res.status(500).json({ reply: "Sorry, something went wrong with the AI." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
