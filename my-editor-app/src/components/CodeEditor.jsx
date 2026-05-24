import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Save, Plus, Trash2, Download, Copy, Check,
  Terminal, FileCode, ArrowLeft, X,
} from 'lucide-react';
import HexieLogo from './HexieLogo';
import {
  TEMPLATES, EXTENSIONS, LANGUAGES, loadStoredFiles, saveStoredFiles,
  getLanguageLabel, resolveRunLanguage,
} from '../lib/editor';
import { runPython } from '../lib/pythonRunner';

export default function CodeEditor({ onBackToHome }) {
  const [files, setFiles] = useState(loadStoredFiles);
  const [activeFileId, setActiveFileId] = useState(() => {
    const stored = loadStoredFiles();
    return stored.length > 0 ? stored[0].id : null;
  });
  const [code, setCode] = useState(() => {
    const stored = loadStoredFiles();
    return stored.length > 0 ? stored[0].content : '';
  });
  const [language, setLanguage] = useState(() => {
    const stored = loadStoredFiles();
    return stored.length > 0 ? stored[0].language : 'javascript';
  });
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [fileName, setFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('javascript');
  const [showNewFile, setShowNewFile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const idCounter = useRef(0);

  const activeFile = files.find((f) => f.id === activeFileId);

  const selectFile = useCallback((file) => {
    setActiveFileId(file.id);
    setCode(file.content);
    setLanguage(file.language);
    setDirty(false);
    setOutput('');
    setShowOutput(false);
  }, []);

  const saveCurrentFile = useCallback(() => {
    if (!activeFileId) return;

    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === activeFileId ? { ...f, content: code, language } : f
      );
      saveStoredFiles(updated);
      return updated;
    });
    setDirty(false);
    setOutput('✓ Saved');
    setShowOutput(true);
    setTimeout(() => setOutput(''), 2000);
  }, [activeFileId, code, language]);

  const runCode = useCallback(async () => {
    const lang = resolveRunLanguage(language, code, activeFile?.name);

    if (lang !== language) {
      setLanguage(lang);
      if (activeFileId) {
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === activeFileId ? { ...f, language: lang } : f
          );
          saveStoredFiles(updated);
          return updated;
        });
      }
    }

    setShowOutput(true);
    setOutput('Running…\n');

    try {
      if (lang === 'python') {
        setOutput('Loading Python runtime (first run may take a few seconds)…\n');
        const result = await runPython(code);
        setOutput(result);
        return;
      }

      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(String).join(' ')),
        error: (...args) => logs.push('ERROR: ' + args.map(String).join(' ')),
        warn: (...args) => logs.push('WARN: ' + args.map(String).join(' ')),
      };
      const fn = new Function('console', code);
      fn(customConsole);
      setOutput(logs.join('\n') || '(no output)');
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  }, [code, language, activeFile?.name, activeFileId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentFile, runCode]);

  const createNewFile = () => {
    if (!fileName.trim()) return;

    idCounter.current += 1;
    const newFile = {
      id: `file-${Date.now()}-${idCounter.current}`,
      name: fileName.trim(),
      language: newFileLang,
      content: TEMPLATES[newFileLang] || '',
      createdAt: new Date().toISOString(),
    };

    setFiles((prev) => {
      const updated = [...prev, newFile];
      saveStoredFiles(updated);
      return updated;
    });
    selectFile(newFile);
    setFileName('');
    setShowNewFile(false);
  };

  const deleteFile = (id) => {
    if (!window.confirm('Delete this file?')) return;

    const updated = files.filter((f) => f.id !== id);
    saveStoredFiles(updated);
    setFiles(updated);

    if (activeFileId === id) {
      if (updated.length > 0) {
        selectFile(updated[0]);
      } else {
        setActiveFileId(null);
        setCode('');
        setLanguage('javascript');
        setDirty(false);
      }
    }
  };

  const downloadFile = () => {
    if (!activeFile) return;
    const ext = EXTENSIONS[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFile.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setDirty(true);
  };

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart, selectionEnd, value } = e.target;
    const updated = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
    setCode(updated);
    setDirty(true);
    requestAnimationFrame(() => {
      e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
    });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setDirty(true);
  };

  const neonBtn = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border';
  const panelStyle = {
    background: 'var(--hexie-bg-elevated)',
    borderColor: 'var(--hexie-border)',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--hexie-bg)' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-60 flex flex-col border-r shrink-0"
          style={{ ...panelStyle, borderRightWidth: 1 }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--hexie-border)' }}>
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-2 text-xs mb-4 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--hexie-neon-cyan)' }}
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>

            <div className="flex items-center gap-3 mb-4">
              <HexieLogo size={36} />
              <div className="text-left">
                <div className="hexie-glow-text font-bold text-lg leading-none">Hexie</div>
                <div className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--hexie-text-muted)' }}>
                  your friendly coding space
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewFile(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(191,0,255,0.15))',
                border: '1px solid rgba(0,245,255,0.3)',
                color: 'var(--hexie-neon-cyan)',
              }}
            >
              <Plus size={16} />
              New File
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-3"
              style={{ color: 'var(--hexie-neon-cyan)', opacity: 0.7 }}
            >
              Files
            </div>
            {files.length === 0 && (
              <p className="text-xs px-2" style={{ color: 'var(--hexie-text-muted)' }}>
                No files yet. Create one to start coding.
              </p>
            )}
            {files.map((file) => (
              <div
                key={file.id}
                role="button"
                tabIndex={0}
                onClick={() => selectFile(file)}
                onKeyDown={(e) => e.key === 'Enter' && selectFile(file)}
                className="flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg cursor-pointer transition-all group"
                style={
                  activeFileId === file.id
                    ? {
                        background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(191,0,255,0.12))',
                        border: '1px solid rgba(0,245,255,0.35)',
                        boxShadow: 'var(--hexie-glow-cyan)',
                      }
                    : { border: '1px solid transparent' }
                }
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileCode size={14} style={{ color: 'var(--hexie-neon-cyan)', flexShrink: 0 }} />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
                  style={{ color: 'var(--hexie-neon-magenta)' }}
                  aria-label={`Delete ${file.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 border-t text-[11px] space-y-1" style={{ borderColor: 'var(--hexie-border)', color: 'var(--hexie-text-muted)' }}>
            <div>{files.length} file{files.length !== 1 ? 's' : ''}</div>
            <div>{getLanguageLabel(language)}{dirty ? ' · unsaved' : ''}</div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b gap-3 flex-wrap"
            style={{ ...panelStyle, borderBottomWidth: 1 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--hexie-text)' }}>
                {activeFile ? activeFile.name : 'No file selected'}
                {dirty && <span style={{ color: 'var(--hexie-neon-magenta)' }}> ●</span>}
              </span>
              <span className="text-[10px] opacity-40 hidden sm:inline">v1.0</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={!activeFileId}
                className="px-3 py-1.5 rounded-lg text-xs border bg-transparent"
                style={{ borderColor: 'var(--hexie-border)', color: 'var(--hexie-text)' }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={copyCode} disabled={!activeFileId} className={neonBtn} style={{ ...panelStyle, color: 'var(--hexie-text-muted)' }} title="Copy (clipboard)">
                {copied ? <Check size={14} style={{ color: 'var(--hexie-neon-green)' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={downloadFile} disabled={!activeFileId} className={neonBtn} style={{ ...panelStyle, color: 'var(--hexie-text-muted)' }} title="Download">
                <Download size={14} />
                Download
              </button>
              <button
                type="button"
                onClick={saveCurrentFile}
                disabled={!activeFileId}
                className={neonBtn}
                style={{ borderColor: 'rgba(255,170,0,0.4)', color: '#ffaa00', background: 'rgba(255,170,0,0.08)' }}
                title="Save (⌘/Ctrl+S)"
              >
                <Save size={14} />
                Save
              </button>
              <button
                type="button"
                onClick={runCode}
                disabled={!activeFileId}
                className={neonBtn}
                style={{ borderColor: 'rgba(57,255,20,0.4)', color: 'var(--hexie-neon-green)', background: 'rgba(57,255,20,0.08)' }}
                title="Run (⌘/Ctrl+Enter)"
              >
                <Play size={14} />
                Run
              </button>
            </div>
          </div>

          {/* Editor + Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto relative">
              {!activeFileId ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <FileCode size={48} style={{ color: 'var(--hexie-neon-cyan)' }} />
                  <p className="text-sm" style={{ color: 'var(--hexie-text-muted)' }}>
                    Create or select a file to start coding
                  </p>
                  <p className="text-xs" style={{ color: 'var(--hexie-text-muted)' }}>
                    ⌘/Ctrl+S to save · ⌘/Ctrl+Enter to run · Tab to indent
                  </p>
                </div>
              ) : (
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleTab}
                  spellCheck={false}
                  className="w-full h-full p-5 resize-none"
                  style={{
                    background: 'var(--hexie-surface)',
                    color: 'var(--hexie-text)',
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    tabSize: 2,
                    caretColor: 'var(--hexie-neon-cyan)',
                    border: 'none',
                  }}
                  placeholder="Start coding…"
                />
              )}
            </div>

            {showOutput && (
              <div className="h-44 flex flex-col border-t shrink-0" style={{ ...panelStyle, borderTopWidth: 1 }}>
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--hexie-border)' }}>
                  <div className="flex items-center gap-2">
                    <Terminal size={14} style={{ color: 'var(--hexie-neon-green)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--hexie-text-muted)' }}>
                      Output
                    </span>
                  </div>
                  <button type="button" onClick={() => setShowOutput(false)} className="opacity-50 hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
                <pre
                  className="flex-1 overflow-auto p-4 text-xs m-0"
                  style={{
                    fontFamily: 'var(--mono)',
                    color: 'var(--hexie-neon-green)',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFile && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNewFile(false)}
        >
          <div
            className="rounded-xl p-6 max-w-sm w-full border"
            style={{ ...panelStyle, boxShadow: 'var(--hexie-glow-cyan)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="hexie-glow-text text-xl font-bold mb-5">New File</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--hexie-text-muted)' }}>
                  File name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNewFile()}
                  placeholder="main"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg border bg-transparent text-sm"
                  style={{ borderColor: 'var(--hexie-border)', color: 'var(--hexie-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--hexie-text-muted)' }}>
                  Language
                </label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border bg-transparent text-sm"
                  style={{ borderColor: 'var(--hexie-border)', color: 'var(--hexie-text)' }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={createNewFile}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #00f5ff, #bf00ff)',
                    color: 'var(--hexie-bg)',
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewFile(false); setFileName(''); }}
                  className="flex-1 py-2.5 rounded-lg text-sm border"
                  style={{ borderColor: 'var(--hexie-border)', color: 'var(--hexie-text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
