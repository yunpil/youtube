import { GoogleGenerativeAI } from "@google/generative-ai";
import { ViralAnalysis, GeneratedResult } from "../types";

// Helper to ensure API key exists
const getClient = (apiKey: string) => {
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("API 키가 없습니다. 우측 상단에서 API 키를 입력해주세요.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateTopicSuggestions = async (
  originalScript: string,
  apiKey: string
): Promise<string[]> => {
  try {
    const genAI = getClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(
      `다음 유튜브 영상 대본의 구조와 스타일을 분석하여, 
      이 구조를 활용하기 좋은 5가지 다른 주제를 추천해주세요.
      
      대본:
      ${originalScript.substring(0, 5000)}
      
      요구사항:
      1. 각 주제는 구체적이고 흥미로워야 합니다
      2. 실제로 영상을 만들 수 있는 현실적인 주제여야 합니다
      3. 다양한 카테고리의 주제를 제안해주세요
      4. 각 주제는 20자 이내로 작성해주세요
      5. JSON 형식으로 응답: {"topics": ["주제1", "주제2", "주제3", "주제4", "주제5"]}`
    );

    const response = await result.response;
    const resultText = response.text();
    
    if (!resultText) {
      throw new Error("주제 추천을 생성하지 못했습니다.");
    }

    // JSON 파싱 시도
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.topics || [];
      }
    } catch {
      // JSON 파싱 실패 시 텍스트에서 주제 추출
      const lines = resultText.split('\n')
        .filter(line => line.trim() && !line.includes('{') && !line.includes('}'))
        .map(line => line.replace(/^[\d\-\*\.\)]+\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 3 && line.length < 50);
      return lines.slice(0, 5);
    }
    
    return [];
  } catch (error: any) {
    console.error('API Error:', error);
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      throw new Error('API 사용량이 초과되었습니다. 잠시 후 다시 시도하거나 다른 API 키를 사용해주세요.');
    }
    if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND')) {
      throw new Error('모델을 찾을 수 없습니다. API 키가 Gemini API에 액세스할 수 있는지 확인해주세요.');
    }
    if (error.message?.includes('API_KEY')) {
      throw new Error('유효하지 않은 API 키입니다. Google AI Studio에서 발급받은 키를 확인해주세요.');
    }
    throw new Error(error.message || '주제 추천 생성 중 오류가 발생했습니다.');
  }
};

export const transformScript = async (
  originalScript: string,
  newTopic: string,
  apiKey: string
): Promise<GeneratedResult> => {
  try {
    const genAI = getClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Step 1: Analyze the original script
    const analysisResult = await model.generateContent(
      `You are a YouTube viral video expert. Analyze the following transcript of a successful video.
      Identify the core elements that made it successful (Hook, Structure, Pacing, Tone).
      
      TRANSCRIPT:
      ${originalScript.substring(0, 15000)}
      
      Respond in JSON format with this structure:
      {
        "hookStrategy": "How the video grabs attention in Korean",
        "pacing": "Speed and rhythm description in Korean",
        "tone": "Emotional tone in Korean",
        "structureBreakdown": ["Step 1 in Korean", "Step 2 in Korean", ...],
        "keyKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
      }`
    );

    const analysisResponse = await analysisResult.response;
    const analysisJsonString = analysisResponse.text();
    
    if (!analysisJsonString) {
      throw new Error("대본 분석에 실패했습니다.");
    }

    let analysis: ViralAnalysis;
    try {
      const jsonMatch = analysisJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found");
      }
    } catch {
      // JSON 파싱 실패 시 기본값 사용
      analysis = {
        hookStrategy: "강력한 첫 인상으로 시청자의 관심을 끕니다",
        pacing: "빠른 템포로 정보를 전달합니다",
        tone: "열정적이고 친근한 톤",
        structureBreakdown: ["인트로", "문제 제기", "해결책 제시", "결론"],
        keyKeywords: ["관심", "흥미", "유익", "재미", "공감"]
      };
    }

    // Step 2: Generate the new script based on the analysis
    const generationResult = await model.generateContent(
      `Based on the following analysis of a viral video structure, write a NEW YouTube script for a completely different topic.
      
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
      6. Write at least 1000 words.`
    );

    const generationResponse = await generationResult.response;
    const newScript = generationResponse.text();
    
    if (!newScript) {
      throw new Error("새로운 대본 생성에 실패했습니다.");
    }

    return {
      analysis,
      newScript,
    };
  } catch (error: any) {
    console.error('API Error:', error);
    
    // 구체적인 에러 메시지 처리
    if (error.message?.includes('quota') || error.message?.includes('exceeded')) {
      throw new Error('API 사용량이 초과되었습니다. 잠시 후 다시 시도하거나 다른 API 키를 사용해주세요.');
    }
    
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      throw new Error('API 키가 유효하지 않습니다. Google AI Studio에서 발급받은 올바른 키를 입력해주세요.');
    }
    
    if (error.message?.includes('billing')) {
      throw new Error('API 키에 결제 정보가 설정되지 않았습니다. Google AI Studio에서 결제를 활성화해주세요.');
    }
    
    if (error.message?.includes('not found') || error.message?.includes('NOT_FOUND')) {
      throw new Error('모델을 찾을 수 없습니다. API 키가 Gemini API에 액세스할 수 있는지 확인해주세요.');
    }
    
    throw new Error(error.message || '대본 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
};