import { GoogleGenAI } from "@google/genai";
import { AnswerKeySection, SegmentedAnswer } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export const aiService = {
  processAnswerSheet: async (
    pdfBase64: string,
    answerKey: AnswerKeySection[]
  ): Promise<SegmentedAnswer[]> => {
    const model = "gemini-3-flash-preview";
    
    // Clean base64 (remove data:application/pdf;base64,)
    const base64Data = pdfBase64.split(',')[1] || pdfBase64;

    const prompt = `
      You are an expert academic evaluator. You are given a handwritten student answer sheet as a PDF and a detailed answer key.
      
      TASK:
      1. Digitize the handwritten text from the PDF precisely.
      2. Identify diagrams and describe them briefly in brackets like [Diagram: Description].
      3. Segment the digitized text strictly into question numbers defined in the Answer Key.
      4. For each question:
         - Provide the digitized text for that specific answer.
         - Compare the student's answer against the "points" provided in the Answer Key.
         - For each point in the Answer Key, determine if the student mentioned it (found: true/false).
      
      ANSWER KEY:
      ${JSON.stringify(answerKey, null, 2)}
      
      OUTPUT FORMAT:
      Return a JSON array of SegmentedAnswer objects:
      interface SegmentedAnswer {
        questionId: string;
        questionNumber: string;
        text: string;
        matches: {
          point: string;
          found: boolean;
        }[];
      }

      Important: ONLY return the JSON array. Do not include markdown formatting or explanations.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || "[]");
      return result;
    } catch (error) {
      console.error("AI Error:", error);
      throw error;
    }
  },
};
