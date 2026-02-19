
import { GoogleGenAI } from "@google/genai";

export const getSecurityInsights = async (visitors: any[], staff: any[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the following gate activity data and provide 3 key security insights or anomalies. 
    Keep it professional and concise for a factory gate management report.
    
    Visitors Today: ${JSON.stringify(visitors.map(v => ({ name: v.name, purpose: v.purpose, status: v.status })))}
    Staff Status: ${JSON.stringify(staff.map(s => ({ name: s.name, code: s.employeeCode, status: s.status })))}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Security Analyst for a high-security manufacturing facility. Focus on potential risks, flow patterns, and procedural compliance.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Insights unavailable at the moment. Please check network connection.";
  }
};
