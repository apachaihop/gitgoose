interface LanguageInfo {
  name: string;
  color: string;
}

const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  js: {
    name: 'JavaScript',
    color: "#f7df1e"
  },
  jsx: {
    name: 'React JSX',
    color: "#61dafb"
  },
  ts: {
    name: 'TypeScript',
    color: '#3178c6'
  },
  tsx: {
    name: 'React TSX',
    color: '#61dafb'
  },
  html: {
    name: 'HTML',
    color: '#e34c26'
  },
  css: {
    name: 'CSS',
    color: '#264de4'
  },
  json: {
    name: 'JSON',
    color: '#292929'
  },
  md: {
    name: 'Markdown',
    color: '#083fa1'
  },
  sh: {
    name: 'Shell Script',
    color: '#89e051'
  },
  py: {
    name: 'Python',
    color: '#3572A5'
  },
  java: {
    name: 'Java',
    color: '#b07219'
  },
  go: {
    name: 'Go',
    color: '#00ADD8'
  },
  rs: {
    name: 'Rust',
    color: '#dea584'
  }
};

export function getLanguageInfo(filename: string): LanguageInfo {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[extension] || {
    name: 'Plain Text',
    color: '#666666'
  };
}