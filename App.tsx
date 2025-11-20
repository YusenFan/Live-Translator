import React, { useState, useEffect, useRef } from 'react';
import { useLiveTranslation } from './hooks/useLiveTranslation';
import { TranslationStatus, AppConfig } from './types';
import { DEFAULT_CONFIG, AVAILABLE_LANGUAGES } from './constants';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SettingsModal } from './components/SettingsModal';

// Icons
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.922-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const bottomEndRef = useRef<HTMLDivElement>(null);

  const { 
    status, 
    translations, 
    error, 
    connect, 
    disconnect, 
    mediaStream,
    clearTranslations 
  } = useLiveTranslation(config);

  const isConnected = status === TranslationStatus.CONNECTED;
  const isConnecting = status === TranslationStatus.CONNECTING;

  // Auto-scroll effect
  useEffect(() => {
    bottomEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [translations]);

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      clearTranslations();
      connect();
    }
  };

  // Determine font classes based on config
  const getFontClass = (langName: string) => {
    const lang = AVAILABLE_LANGUAGES.find(l => l.id === langName);
    return lang ? lang.fontClass : 'font-sans';
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#0f172a] text-white relative">
      
      {/* --- Top Half: Language 1 --- */}
      <div className="flex-1 flex flex-col border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-4 left-6 z-10">
          <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs font-semibold text-blue-400 tracking-wide uppercase backdrop-blur-sm border border-slate-700">
            {config.lang1}
          </span>
        </div>
        
        <div className={`flex-1 p-8 overflow-y-auto flex flex-col justify-end ${getFontClass(config.lang1)}`}>
          {translations.length === 0 && (
            <div className="text-slate-600 text-center text-2xl font-light italic opacity-50 h-full flex items-center justify-center">
              Waiting for speech...
            </div>
          )}
          {translations.map((t, i) => (
            <div key={i} className="text-3xl md:text-5xl font-medium text-slate-100 leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {t.lang1Text}
            </div>
          ))}
        </div>
      </div>

      {/* --- Center Controls (Floating) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-4">
        
        <button
          onClick={() => setIsSettingsOpen(true)}
          disabled={isConnected || isConnecting}
          className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-slate-600
            ${isConnected ? 'bg-slate-900/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-105'}`}
        >
          <SettingsIcon />
        </button>

        <div className="relative group">
          {isConnecting && (
            <div className="absolute inset-0 rounded-full bg-blue-500 blur opacity-50 animate-ping"></div>
          )}
          <button
            onClick={handleToggleConnection}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-4 
              ${isConnected 
                ? 'bg-red-500 border-red-600 hover:bg-red-600 hover:scale-105' 
                : isConnecting 
                  ? 'bg-slate-700 border-slate-600 cursor-wait'
                  : 'bg-blue-600 border-blue-500 hover:bg-blue-500 hover:scale-105'
              }`}
          >
            {isConnected ? <StopIcon /> : <MicIcon />}
          </button>
        </div>

        {isConnected && (
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none">
            <AudioVisualizer stream={mediaStream} isActive={isConnected} />
          </div>
        )}
      </div>

      {/* --- Bottom Half: Language 2 --- */}
      <div className="flex-1 flex flex-col bg-slate-900/50 relative overflow-hidden">
         <div className="absolute top-4 left-6 z-10">
          <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs font-semibold text-teal-400 tracking-wide uppercase backdrop-blur-sm border border-slate-700">
            {config.lang2}
          </span>
        </div>

        <div className={`flex-1 p-8 overflow-y-auto flex flex-col ${getFontClass(config.lang2)}`}>
           {translations.length === 0 && (
            <div className="text-slate-600 text-center text-2xl font-light italic opacity-50 h-full flex items-center justify-center">
              Waiting for speech...
            </div>
          )}
          {translations.map((t, i) => (
            <div key={i} className="text-3xl md:text-5xl font-medium text-teal-50 leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {t.lang2Text}
            </div>
          ))}
          <div ref={bottomEndRef} />
        </div>
      </div>

      {/* --- Status / Error Toast --- */}
      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm font-medium animate-bounce">
          {error}
        </div>
      )}
      
      {isConnecting && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-500/20 text-blue-200 px-4 py-1 rounded-full backdrop-blur-sm text-xs font-medium border border-blue-500/30">
          Connecting to Gemini Live...
        </div>
      )}

      {/* --- Settings Modal --- */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={(newConfig) => setConfig(newConfig)}
      />

    </div>
  );
};

export default App;