// 비속어 필터링 유틸리티
// 실제 운영에서는 더 정교한 필터링 시스템을 사용해야 합니다.

const profanityList = [
  // 한국어 비속어 (예시)
  '바보', '멍청이', '개새끼', '병신', '씨발', '좆', '개', '새끼',
  // 영어 비속어 (예시)
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy',
  // 변형된 형태들
  '바보야', '멍청아', '개새끼야', '병신아'
];

const replacementMap: { [key: string]: string } = {
  '바보': '🤔',
  '멍청이': '🤔',
  '개새끼': '🐕',
  '병신': '🤔',
  '씨발': '💢',
  '좆': '💢',
  '개': '🐕',
  '새끼': '🐕',
  'fuck': '💢',
  'shit': '💩',
  'bitch': '🐕',
  'asshole': '💢',
  'dick': '💢',
  'pussy': '🐱'
};

export const profanityFilter: {
  detectProfanity: (text: string) => boolean;
  filterText: (text: string) => string;
  addProfanity: (word: string, replacement?: string) => void;
  removeProfanity: (word: string) => void;
  filterLevel: {
    NONE: 'none';
    LIGHT: 'light';
    MEDIUM: 'medium';
    STRICT: 'strict';
  };
  filterByLevel: (text: string, level: 'NONE' | 'LIGHT' | 'MEDIUM' | 'STRICT') => string;
} = {
  // 비속어 감지
  detectProfanity: (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word.toLowerCase()));
  },

  // 비속어 필터링 및 대체
  filterText: (text: string): string => {
    let filteredText = text;
    
    profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const replacement = replacementMap[word.toLowerCase()] || '🤔';
      filteredText = filteredText.replace(regex, replacement);
    });
    
    return filteredText;
  },

  // 비속어 목록에 단어 추가
  addProfanity: (word: string, replacement?: string) => {
    if (!profanityList.includes(word)) {
      profanityList.push(word);
      if (replacement) {
        replacementMap[word.toLowerCase()] = replacement;
      }
    }
  },

  // 비속어 목록에서 단어 제거
  removeProfanity: (word: string) => {
    const index = profanityList.indexOf(word);
    if (index > -1) {
      profanityList.splice(index, 1);
      delete replacementMap[word.toLowerCase()];
    }
  },

  // 필터링 강도 설정
  filterLevel: {
    NONE: 'none',
    LIGHT: 'light',
    MEDIUM: 'medium',
    STRICT: 'strict'
  } as const,

  // 강도별 필터링
  filterByLevel: (text: string, level: 'NONE' | 'LIGHT' | 'MEDIUM' | 'STRICT'): string => {
    switch (level) {
      case 'NONE':
        return text;
      case 'LIGHT':
        // 기본적인 비속어만 필터링
        return profanityFilter.filterText(text);
      case 'MEDIUM':
        // 중간 강도 필터링 (추가 패턴 포함)
        return profanityFilter.filterText(text)
          .replace(/\b\w*[씨시]발\w*\b/gi, '💢')
          .replace(/\b\w*[병]신\w*\b/gi, '🤔');
      case 'STRICT':
        // 엄격한 필터링 (모든 의심스러운 패턴)
        return profanityFilter.filterText(text)
          .replace(/\b\w*[개]새끼\w*\b/gi, '🐕')
          .replace(/\b\w*[바]보\w*\b/gi, '🤔');
      default:
        return text;
    }
  }
}; 