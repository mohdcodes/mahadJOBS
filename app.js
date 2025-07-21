// Final Gemini Resume Evaluation API using Supabase PostgreSQL (Cloud, not local)
// For MahadGroup Assignment - Mohd Arbaaz Siddiqui

import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// Connect to Supabase PostgreSQL (cloud, not local)
const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log('Connected to Supabase PostgreSQL (Cloud)'))
  .catch((err) => console.error('DB Connection Error:', err));

// Gemini LLM Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateResumeWithGemini(resumeText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const prompt = `You are a resume evaluator. Evaluate this resume and provide:\n- Score out of 100\n- A short 3-4 line summary\n- Clear improvement suggestions.\n\nResume:\n\"\"\"\n${resumeText}\n\"\"\"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function parseGeminiOutput(outputText) {
  const scoreMatch = outputText.match(/Score[\s:]*([0-9]{1,3})/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  const summaryMatch = outputText.match(
    /Summary[\s:]*([\s\S]*?)(\n\n|Suggestion)/i
  );
  const summary = summaryMatch ? summaryMatch[1].trim() : null;
  const suggestionMatch = outputText.match(/Suggestion[\s:]*([\s\S]*)/i);
  const suggestion = suggestionMatch ? suggestionMatch[1].trim() : null;
  return { score, summary, suggestion };
}

app.post('/api/analyze-resume', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText)
    return res.status(400).json({ error: 'resumeText is required' });

  try {
    const geminiOutput = await evaluateResumeWithGemini(resumeText);
    const { score, summary, suggestion } = parseGeminiOutput(geminiOutput);
    const insertQuery = `INSERT INTO resumes (raw_text, score, summary, suggestion, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`;
    const result = await db.query(insertQuery, [
      resumeText,
      score,
      summary,
      suggestion,
    ]);
    res.json({
      success: true,
      data: result.rows[0],
      rawGeminiOutput: geminiOutput,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} using Supabase PostgreSQL cloud`);
});
