import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { matchQuery } from '../utils/chatbotMatcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import knowledgeBase from '../data/chatbotKnowledgeBase.json';
import { Link } from '@tanstack/react-router';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  pageLink?: string;
}

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: t('chatbot.greeting'), isBot: true },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now(), text: trimmed, isBot: false };
    const match = matchQuery(trimmed, knowledgeBase as any);

    const botMsg: Message = match
      ? { id: Date.now() + 1, text: match.answer, isBot: true, pageLink: match.pageLink }
      : { id: Date.now() + 1, text: t('chatbot.fallback'), isBot: true, pageLink: '/help' };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Open chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '480px' }}
        >
          {/* Header */}
          <div className="bg-teal-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-saffron flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t('chatbot.title')}</p>
                <p className="text-teal-300 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-300 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
            style={{ minHeight: '280px', maxHeight: '320px' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.isBot
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-xs'
                      : 'bg-teal-700 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.isBot && msg.pageLink && (
                    <Link
                      to={msg.pageLink as any}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-teal-600 hover:text-teal-800 font-medium"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('chatbot.visitPage')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 text-sm h-9 border-gray-200 focus:border-teal-400"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-9 w-9 p-0 bg-teal-700 hover:bg-teal-800 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
