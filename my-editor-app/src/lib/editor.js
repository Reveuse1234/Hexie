export const STORAGE_KEY = 'hexie-code-files';
export const LEGACY_STORAGE_KEY = 'code-files';

/** Languages that run fully in the browser */
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
];

export const TEMPLATES = {
  javascript: `// JavaScript
console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));`,
  python: `# Python
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))`,
};

export const EXTENSIONS = {
  javascript: 'js',
  python: 'py',
};

export function normalizeLanguage(lang) {
  const id = String(lang ?? '').trim().toLowerCase();
  if (LANGUAGES.some((l) => l.id === id)) return id;
  const byLabel = LANGUAGES.find((l) => l.label.toLowerCase() === id);
  return byLabel?.id ?? 'javascript';
}

export function languageFromFileName(name) {
  if (!name) return null;
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'js' || ext === 'mjs') return 'javascript';
  return null;
}

export function looksLikePython(code) {
  const first = code.trimStart().split('\n')[0] ?? '';
  if (/^#\s*python\b/i.test(first)) return true;
  if (/^\s*def\s+\w+\s*\(/.test(code)) return true;
  if (/^\s*print\s*\(/.test(code) && !/console\.log/.test(code)) return true;
  return false;
}

export function resolveRunLanguage(language, code, fileName) {
  const fromName = languageFromFileName(fileName);
  const normalized = normalizeLanguage(language);
  if (fromName === 'python' || normalized === 'python' || looksLikePython(code)) {
    return 'python';
  }
  return 'javascript';
}

export function migrateFile(file) {
  return { ...file, language: resolveRunLanguage(file.language, file.content, file.name) };
}

export function getLanguageLabel(id) {
  return LANGUAGES.find((l) => l.id === id)?.label ?? id.toUpperCase();
}

export function loadStoredFiles() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    return raw ? JSON.parse(raw).map(migrateFile) : [];
  } catch {
    return [];
  }
}

export function saveStoredFiles(files) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.error('Failed to save files:', err);
  }
}
