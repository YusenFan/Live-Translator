import React, { useState } from 'react';
import { AppConfig, LanguageConfig } from '../types';
import { AVAILABLE_LANGUAGES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Configuration</h2>
        
        <div className="space-y-6">
          {/* Lang 1 Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Top Screen Language</label>
            <select 
              value={localConfig.lang1}
              onChange={(e) => setLocalConfig({ ...localConfig, lang1: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={`l1-${lang.id}`} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Lang 2 Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Bottom Screen Language</label>
            <select 
              value={localConfig.lang2}
              onChange={(e) => setLocalConfig({ ...localConfig, lang2: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={`l2-${lang.id}`} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};