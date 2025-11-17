
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage, ChatRole } from './types';
import { ChatMessageComponent } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const AttachmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const ModelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);


const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('You are HacxGPT, a helpful AI assistant with a slightly edgy, cyberpunk personality. You answer concisely and sometimes use slang from the digital underground.');
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initChat = () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemPrompt,
                    },
                });
                setChat(newChat);
                setMessages([
                    { role: ChatRole.Model, text: 'HacxGPT online. System message loaded. How can I assist you, operator? Attach files if needed.' }
                ]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                setMessages([{ role: ChatRole.Model, text: "Error: Could not connect to the AI service. Please check your API key and configuration." }]);
            }
        };
        initChat();
    }, [systemPrompt]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const fileToGenerativePart = async (file: File) => {
      const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      return {
        inlineData: {
          data: base64EncodedData,
          mimeType: file.type,
        },
      };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasContent = input.trim() || attachedFiles.length > 0;
        if (!hasContent || isLoading || !chat) return;

        const userMessage: ChatMessage = {
            role: ChatRole.User,
            text: input,
            files: attachedFiles.map(f => ({ name: f.name, type: f.type })),
        };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        const currentInput = input;
        const currentFiles = [...attachedFiles];
        setInput('');
        setAttachedFiles([]);

        try {
            const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = 
                await Promise.all(currentFiles.map(fileToGenerativePart));

            if (currentInput.trim()) {
                parts.push({ text: currentInput });
            }
            
            const stream = await chat.sendMessageStream({ message: parts });
            
            let firstChunk = true;
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (firstChunk) {
                    setMessages(prev => [...prev, { role: ChatRole.Model, text: chunkText }]);
                    firstChunk = false;
                } else {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        newMessages[newMessages.length - 1] = {
                            ...lastMessage,
                            text: lastMessage.text + chunkText,
                        };
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: ChatRole.Model, text: "Apologies, operator. I've hit a snag in the net. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
        e.target.value = '';
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setAttachedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };


    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-mono">
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentSystemPrompt={systemPrompt}
                onSave={setSystemPrompt}
            />
            <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm z-10">
                <h1 className="text-xl md:text-2xl font-bold text-cyan-400">HacxGPT</h1>
                <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-gray-700">
                    <SettingsIcon />
                </button>
            </header>

            <main ref={chatContainerRef} className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-800">
                    {messages.map((msg, index) => (
                        <ChatMessageComponent key={index} message={msg} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === ChatRole.User && (
                        <div className="flex items-start gap-4 p-4 md:p-6">
                            <div className="flex-shrink-0">
                                <ModelIcon />
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className="font-bold text-sm mb-1 text-cyan-400">
                                    HacxGPT
                                </p>
                                <div className="flex items-center space-x-2 pt-1">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="max-w-4xl mx-auto">
                    {attachedFiles.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {attachedFiles.map((file, index) => (
                                <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-300 flex items-center gap-2">
                                    <FileIcon />
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <button onClick={() => handleRemoveFile(index)} className="text-gray-400 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,image/*"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="p-3 text-gray-400 hover:text-cyan-400 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                            aria-label="Attach files"
                        >
                            <AttachmentIcon />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter your query..."
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                            className="bg-cyan-600 text-white p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors"
                             aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
};

export default App;
