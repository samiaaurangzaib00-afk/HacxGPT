
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSystemPrompt: string;
  onSave: (newPrompt: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSystemPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(currentSystemPrompt);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg mx-4 text-white border border-gray-700 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">System Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>
          <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            System Message
          </label>
          <textarea
            id="system-prompt"
            rows={8}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., You are a helpful AI assistant."
          />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold transition-colors"
          >
            Save & Reset Chat
          </button>
        </div>
      </div>
    </div>
  );
};
