import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Brain } from 'lucide-react';
import api from '../api';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi there! I'm your AI Memory Companion. I've been reflecting on your life memories. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chat/', { message: userMessage });
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: res.data.reply,
        memoryId: res.data.referenced_memory_id 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting right now. Please try again later." }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 p-4 border-b-0 flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">AI Companion</h2>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
      </div>

      <div className="flex-1 bg-white border-x border-gray-100 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-blue-600" />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                <p className="text-sm">{msg.content}</p>
                {msg.memoryId && (
                  <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs opacity-75 flex items-center">
                    <Brain className="w-3 h-3 justify-center" />
                    <span className="ml-1 italic">Recalling past memory...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-sm border border-gray-100 flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk with your AI companion..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-6 pr-14 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
