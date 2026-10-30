import express from "express";
import { protect, roles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, roles("citizen"));

const allowedFields = ["title", "description", "category", "department", "priority", "address", "city"];

router.post("/complaint-assistant", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: "AI assistant is not configured yet. Add GEMINI_API_KEY to the server .env file." });
    }

    const { message, history = [], currentForm = {}, categories = [], departments = [] } = req.body || {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Please tell the assistant about your problem." });
    }

    const safeHistory = Array.isArray(history) ? history.slice(-10).map((item) => ({
      role: item?.role === "assistant" ? "model" : "user",
      parts: [{ text: String(item?.text || "").slice(0, 1500) }]
    })) : [];

    const prompt = `You are JanConnect AI, a patient and respectful assistant helping Indian citizens, including people with low literacy, write civic complaints. Reply in the language the citizen uses (Hindi/Hinglish/English). Ask only one simple follow-up question at a time if important information is missing. Never invent facts. Do not ask for Aadhaar number, bank details, passwords, or other unnecessary sensitive information. The AI only drafts a complaint; the citizen must review and submit it themselves.

Return ONLY valid JSON with this exact shape: {"reply":"short friendly response to citizen","fields":{"title":"","description":"","category":"","department":"","priority":"Medium","address":"","city":""}}. Keep fields already known from current form unless the citizen corrects them. Use empty strings for unknown text fields. For category and department, return a name from the supplied lists only, otherwise empty string. Priority must be Low, Medium, High, or Critical; default Medium and don't mark Critical unless clearly urgent. Title should be short and clear. Description should be a clear factual complaint in the citizen's own meaning, not embellished. Address should describe where the issue occurs. Do not claim complaint has been submitted.

Available categories: ${JSON.stringify(categories.map(x => x.name))}
Available departments: ${JSON.stringify(departments.map(x => x.name))}
Current draft: ${JSON.stringify(Object.fromEntries(allowedFields.map(k => [k, currentForm?.[k] ?? ""] )))}
Citizen's latest message: ${message.trim().slice(0, 2000)}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You help draft civic complaints accurately and accessibly. Never submit anything or invent details." }] },
        contents: [...safeHistory, { role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.25, responseMimeType: "application/json" }
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", payload?.error?.message || response.status);
      return res.status(502).json({ message: "AI assistant could not respond right now. Please try again." });
    }
    const raw = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
    if (!raw) return res.status(502).json({ message: "AI returned an empty response. Please try again." });

    let result;
    try { result = JSON.parse(raw); } catch {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
      result = JSON.parse(cleaned);
    }
    const fields = {};
    for (const key of allowedFields) {
      const value = result?.fields?.[key];
      fields[key] = typeof value === "string" ? value.slice(0, key === "description" ? 5000 : 500) : "";
    }
    if (!["Low", "Medium", "High", "Critical"].includes(fields.priority)) fields.priority = "Medium";
    const categoryNames = categories.map(x => x.name.toLowerCase());
    if (fields.category && !categoryNames.includes(fields.category.toLowerCase())) fields.category = "";
    const departmentNames = departments.map(x => x.name.toLowerCase());
    if (fields.department && !departmentNames.includes(fields.department.toLowerCase())) fields.department = "";
    res.json({ reply: String(result?.reply || "I have updated the draft. Please review it.").slice(0, 1000), fields });
  } catch (error) {
    console.error("Complaint assistant error:", error.message);
    res.status(500).json({ message: "Something went wrong with the AI assistant. Please try again." });
  }
});

export default router;
