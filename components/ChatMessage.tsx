
import React from 'react';
import { ChatMessage, ChatRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ModelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === ChatRole.User;

  return (
    <div className={`flex items-start gap-4 p-4 md:p-6 ${isUser ? 'bg-gray-800/50' : ''}`}>
      <div className="flex-shrink-0">
        {isUser ? <UserIcon /> : <ModelIcon />}
      </div>
      <div className="flex-1 pt-0.5">
        <p className={`font-bold text-sm mb-1 ${isUser ? 'text-gray-300' : 'text-cyan-400'}`}>
          {isUser ? 'You' : 'HacxGPT'}
        </p>
        {message.text && <p className="text-gray-200 whitespace-pre-wrap">{message.text}</p>}
        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.files.map((file, index) => (
              <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-300 flex items-center gap-2">
                <FileIcon />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
