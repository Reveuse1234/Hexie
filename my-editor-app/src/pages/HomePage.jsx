import { ArrowRight, Code2, Terminal, Zap } from 'lucide-react';
import HexieLogo from '../components/HexieLogo';

export default function HomePage({ onOpenEditor }) {
  return (
    <div className="hexie-grid-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00f5ff, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #bf00ff, transparent 70%)' }}
        aria-hidden
      />

      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div
          className="mb-8"
          style={{ animation: 'hexie-float 4s ease-in-out infinite' }}
        >
          <HexieLogo size={100} />
        </div>

        <h1 className="hexie-glow-text text-6xl md:text-7xl font-bold tracking-tight mb-6">
          Hexie
        </h1>

        <p className="text-xl md:text-2xl text-[var(--hexie-text-muted)] mb-10 font-light tracking-wide">
          your friendly coding space
        </p>

        <button
          type="button"
          onClick={onOpenEditor}
          className="group flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-[var(--hexie-bg)] transition-all duration-300 hover:scale-105 active:scale-100"
          style={{
            background: 'linear-gradient(135deg, #00f5ff, #bf00ff)',
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.4), 0 0 60px rgba(191, 0, 255, 0.2)',
          }}
        >
          Open Editor
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
          {[
            { icon: Code2, label: 'Two languages', desc: 'JavaScript & Python' },
            { icon: Terminal, label: 'Live output', desc: 'Run code in the browser instantly' },
            { icon: Zap, label: 'Local storage', desc: 'Files persist between sessions' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--hexie-border)] bg-[var(--hexie-surface)]/50 backdrop-blur-sm"
            >
              <Icon size={22} style={{ color: 'var(--hexie-neon-cyan)' }} />
              <span className="text-sm font-medium text-[var(--hexie-text)]">{label}</span>
              <span className="text-xs text-[var(--hexie-text-muted)]">{desc}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-6 text-xs text-[var(--hexie-text-muted)] opacity-50">
        Hexie
      </footer>
    </div>
  );
}
