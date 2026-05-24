import { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import HomePage from './pages/HomePage';

function App() {
  const [view, setView] = useState('home');

  if (view === 'home') {
    return <HomePage onOpenEditor={() => setView('editor')} />;
  }

  return <CodeEditor onBackToHome={() => setView('home')} />;
}

export default App;
