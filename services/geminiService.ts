
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";
import { MemoStructuredData, SceneMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// Helper to get YYYY-MM-DD in local time
const getLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const analyzeTranscript = async (
  transcript: string, 
  mode: SceneMode
): Promise<MemoStructuredData> => {
  try {
    const today = getLocalISODate(new Date());
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[Today: ${today}]\n[Context: ${mode}]\n[Original Content: ${transcript}]\n\nTask: Transcribe literally into 'summary'. Extract categories following the strict mutual exclusivity rule for primary tags.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            categories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Must contain exactly one of [Idea, Meeting, Study, Personal], and optionally 'To-do'."
            },
            type: { type: Type.STRING },
            dueDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            mindMapNodes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  id: { type: Type.STRING }, 
                  label: { type: Type.STRING } 
                } 
              } 
            }
          },
          required: ["title", "summary", "categories", "type", "keyPoints", "actionItems"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as MemoStructuredData;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const transcribeAndAnalyze = async (
  audioBase64: string,
  mode: SceneMode
): Promise<{ transcript: string; analysis: MemoStructuredData }> => {
  try {
    const today = getLocalISODate(new Date());
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "audio/mp3",
            data: audioBase64
          }
        },
        { text: `[Today: ${today}] Transcribe literally. Strictly enforce category exclusivity: Pick ONE from {Idea, Meeting, Study, Personal} and optionally 'To-do'.` }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      transcript: result.summary || "Audio processed.",
      analysis: result as MemoStructuredData
    };
  } catch (error) {
    console.error("Gemini Full Process Error:", error);
    throw error;
  }
};
