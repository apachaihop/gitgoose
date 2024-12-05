interface LanguageStats {
    language: string;
    percentage: number;
    bytes: number;
  }
  
  export const getMainLanguages = (languageStats?: LanguageStats[]) => {
    if (!languageStats) return [];
    
    return [...languageStats]
      .filter(stat => stat.percentage >= 20)
      .sort((a, b) => b.percentage - a.percentage);
  };
  
  export const getAllLanguages = (languageStats?: LanguageStats[]) => {
    if (!languageStats) return [];
    
    return [...languageStats]
      .sort((a, b) => b.percentage - a.percentage);
  };
  
  export const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#DEA584',
      PHP: '#4F5D95',
      Ruby: '#701516',
      'C++': '#f34b7d',
      C: '#555555',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Dart: '#00B4AB',
      JSON: '#292929',
      Markdown: '#083fa1',
    };
    return colors[language] || '#808080';
  };