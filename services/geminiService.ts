import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ViralAnalysis, GeneratedResult } from "../types";

// Helper to ensure API key exists
const getClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key가 없습니다. .env.local 파일에 VITE_API_KEY를 설정해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hookStrategy: {
      type: Type.STRING,
      description: "Analysis of how the video grabs attention in the first 10 seconds.",
    },
    pacing: {
      type: Type.STRING,
      description: "Description of the speed, editing rhythm, and information density.",
    },
    tone: {
      type: Type.STRING,
      description: "The emotional tone and delivery style (e.g., energetic, mysterious, educational).",
    },
    structureBreakdown: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A step-by-step list of the script's structural flow (e.g., Intro -> Problem -> Twist -> Solution).",
    },
    keyKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 powerful keywords or phrases used to retain audience.",
    },
  },
  required: ["hookStrategy", "pacing", "tone", "structureBreakdown", "keyKeywords"],
};

const topicSuggestionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 recommended video topics based on the script structure",
    },
  },
  required: ["topics"],
};

export const generateTopicSuggestions = async (
  originalScript: string
): Promise<string[]> => {
  const ai = getClient();
  const modelId = "gemini-2.0-flash-exp";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `
      다음 유튜브 영상 대본의 구조와 스타일을 분석하여, 
      이 구조를 활용하기 좋은 5가지 다른 주제를 추천해주세요.
      
      대본:
      ${originalScript.substring(0, 5000)}
      
      요구사항:
      1. 각 주제는 구체적이고 흥미로워야 합니다
      2. 실제로 영상을 만들 수 있는 현실적인 주제여야 합니다
      3. 다양한 카테고리의 주제를 제안해주세요
      4. 각 주제는 20자 이내로 작성해주세요
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: topicSuggestionsSchema,
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("주제 추천을 생성하지 못했습니다.");
  }

  const result = JSON.parse(resultText);
  return result.topics || [];
};

export const transformScript = async (
  originalScript: string,
  newTopic: string
): Promise<GeneratedResult> => {
  const ai = getClient();
  const modelId = "gemini-2.0-flash-exp"; // Using Flash for speed and efficiency

  // Step 1: Analyze the original script
  // We use a specific model call for analysis to get structured JSON
  const analysisResponse = await ai.models.generateContent({
    model: modelId,
    contents: `
      You are a YouTube viral video expert. Analyze the following transcript of a successful video.
      Identify the core elements that made it successful (Hook, Structure, Pacing, Tone).
      
      TRANSCRIPT:
      ${originalScript.substring(0, 15000)} 
    `, // Limiting char count loosely to avoid token limits on huge transcripts
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: "You are an expert script analyst for YouTube. Analyze strictly in Korean.",
    },
  });

  const analysisJsonString = analysisResponse.text;
  if (!analysisJsonString) {
    throw new Error("Failed to analyze the script.");
  }

  const analysis: ViralAnalysis = JSON.parse(analysisJsonString);

  // Step 2: Generate the new script based on the analysis
  const generationResponse = await ai.models.generateContent({
    model: modelId,
    contents: `
      Based on the following analysis of a viral video structure, write a NEW YouTube script for a completely different topic.
      
      TARGET TOPIC: ${newTopic}
      
      VIRAL ANALYSIS DATA:
      - Hook Strategy: ${analysis.hookStrategy}
      - Tone: ${analysis.tone}
      - Pacing: ${analysis.pacing}
      - Structure: ${analysis.structureBreakdown.join(" -> ")}
      
      INSTRUCTIONS:
      1. Write the full script in Korean.
      2. Strictly follow the "Structure" identified in the analysis.
      3. Mimic the sentence length and energy of the original style.
      4. Include [Scene/Visual Notes] in brackets to guide editing.
      5. Make the hook extremely strong.
    `,
    config: {
      temperature: 0.8, // Slightly creative
    },
  });

  const newScript = generationResponse.text;
  if (!newScript) {
    throw new Error("Failed to generate the new script.");
  }

  return {
    analysis,
    newScript,
  };
};