export interface ViralAnalysis {
  hookStrategy: string;
  pacing: string;
  tone: string;
  structureBreakdown: string[];
  keyKeywords: string[];
}

export interface GeneratedResult {
  analysis: ViralAnalysis;
  newScript: string;
}

export enum AppState {
  INPUT = 'INPUT',
  TOPIC_SUGGESTIONS = 'TOPIC_SUGGESTIONS',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export const LOADING_MESSAGES = [
  "떡상 영상의 DNA를 분석하는 중...",
  "후킹 포인트 추출 중...",
  "알고리즘이 좋아할 패턴 찾는 중...",
  "새로운 주제에 바이럴 구조 입히는 중...",
  "거의 다 되었습니다! 대박 날 준비 하세요."
];