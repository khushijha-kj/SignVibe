require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

exports.llmHelp = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const userQuery = req.body.query;

  if (!userQuery || typeof userQuery !== "string") {
    return res
      .status(400)
      .json({ error: "query is required and must be a string." });
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `I am a School student learning STEM. As am a disable kid and I cannot hear so I find it tough to learn and understand STEM. Please help me with my query : ${userQuery}`,
  });

  return res.status(200).json({
    message: "LLM Help response",
    data: response.text,
  });
};
