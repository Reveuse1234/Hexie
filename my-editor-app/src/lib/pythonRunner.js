const PYODIDE_VERSION = '0.29.4';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReady = null;

function loadPyodideScript() {
  if (typeof globalThis.loadPyodide === 'function') {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-hexie-pyodide]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = `${PYODIDE_BASE}pyodide.js`;
    script.dataset.hexiePyodide = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide from CDN. Check your internet connection.'));
    document.head.appendChild(script);
  });
}

function getPyodide() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      await loadPyodideScript();
      return globalThis.loadPyodide({ indexURL: PYODIDE_BASE });
    })();
  }
  return pyodideReady;
}

/**
 * Run Python source in the browser via Pyodide (CDN).
 * @param {string} code
 * @returns {Promise<string>}
 */
export async function runPython(code) {
  const pyodide = await getPyodide();
  const lines = [];

  pyodide.setStdout({ batched: (text) => lines.push(text) });
  pyodide.setStderr({ batched: (text) => lines.push(text) });

  try {
    await pyodide.runPythonAsync(code);
    const out = lines.join('\n').trimEnd();
    return out || '(no output)';
  } catch (err) {
    const msg = err?.message ?? String(err);
    const trace = lines.length ? `${lines.join('\n')}\n` : '';
    return `${trace}Error: ${msg}`.trim();
  } finally {
    pyodide.setStdout();
    pyodide.setStderr();
  }
}
