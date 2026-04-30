import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './SectionWrapper';
import { sendChatMessage } from '../utils/api';

// ── Suggested quick prompts ───────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Should I train today?',
  "Why isn't my bench progressing?",
  'Give me a deload plan',
  "What's my strongest lift?",
  'How is my training consistency?',
  'Recommend my next workout focus',
];

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots({ isDarkMode }) {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`block w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scaleY(0.5); opacity: 0.4; }
          40% { transform: scaleY(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

TypingDots.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
};

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isDarkMode }) {
  const isUser = msg.role === 'user';
  const mono = { fontFamily: "'IBM Plex Mono', monospace" };

  // Render markdown-ish formatting (bold, bullet points)
  const renderContent = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold: **text**
        const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
        return (
          <p
            key={i}
            className={`${isBullet ? 'pl-2' : ''} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: boldParsed || '&nbsp;' }}
          />
        );
      });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Avatar — assistant only */}
      {!isUser && (
        <div
          className={`w-7 h-7 shrink-0 flex items-center justify-center border mr-2 mt-0.5 ${
            isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[78%] px-4 py-3 text-sm space-y-1 ${
          isUser
            ? isDarkMode
              ? 'bg-white text-gray-900'
              : 'bg-gray-900 text-white'
            : isDarkMode
            ? 'bg-gray-900 border border-gray-800 text-gray-200'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
        style={mono}
      >
        {renderContent(msg.content)}
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div
          className={`w-7 h-7 shrink-0 flex items-center justify-center border ml-2 mt-0.5 ${
            isDarkMode ? 'border-gray-700 bg-white text-gray-900' : 'border-gray-800 bg-gray-900 text-white'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

MessageBubble.propTypes = {
  msg: PropTypes.shape({
    role: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default function AiCoach({ isDarkMode }) {
  const mono = { fontFamily: "'IBM Plex Mono', monospace" };
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello. I'm your AI training coach, grounded in your actual workout data.\n\nAsk me anything — your progress, recovery, programming, or what to train next.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(
    async (text) => {
      const msg = (text || input).trim();
      if (!msg || isLoading) return;

      setInput('');
      setError(null);

      const newUserMsg = { role: 'user', content: msg };
      const updatedMessages = [...messages, newUserMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        // Send history without the very first system greeting to save tokens
        const history = updatedMessages.slice(1, -1).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const data = await sendChatMessage(msg, history);
        setMessages((prev) => [...prev, { role: 'assistant', content: data.data.reply }]);
      } catch (err) {
        const errMsg = err?.message || 'Failed to get a response. Please try again.';
        setError(errMsg);
        // Remove the optimistic user message on failure
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [input, isLoading, messages]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const borderCls = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const bgCls = isDarkMode ? 'bg-gray-950' : 'bg-gray-50';
  const inputBgCls = isDarkMode ? 'bg-gray-900 text-gray-100 placeholder-gray-600' : 'bg-white text-gray-900 placeholder-gray-400';

  return (
    <SectionWrapper isDarkMode={isDarkMode}>
      <div className="max-w-3xl mx-auto px-4 py-8 h-full flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="mb-6">
          <p
            className={`text-xs uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            style={mono}
          >
            / AI System
          </p>
          <h1
            className={`text-2xl font-black uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            style={mono}
          >
            Training Coach
          </h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} style={mono}>
            Context-aware • Grounded in your actual data
          </p>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 border transition-colors duration-150 ${
                isDarkMode
                  ? 'border-gray-700 text-gray-400 hover:border-gray-400 hover:text-gray-200 disabled:opacity-40'
                  : 'border-gray-300 text-gray-600 hover:border-gray-700 hover:text-gray-900 disabled:opacity-40'
              }`}
              style={mono}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages area */}
        <div
          className={`flex-1 overflow-y-auto border ${borderCls} ${bgCls} p-4 mb-4`}
          style={{ minHeight: 320, maxHeight: 'calc(100vh - 420px)' }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} isDarkMode={isDarkMode} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div
                className={`w-7 h-7 shrink-0 flex items-center justify-center border mr-2 mt-0.5 ${
                  isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-100'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div
                className={`px-4 py-3 border ${
                  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <TypingDots isDarkMode={isDarkMode} />
              </div>
            </div>
          )}

          {error && (
            <div
              className={`text-xs px-4 py-3 border mb-4 ${
                isDarkMode
                  ? 'border-red-900 text-red-400 bg-red-950/30'
                  : 'border-red-200 text-red-700 bg-red-50'
              }`}
              style={mono}
            >
              ERROR: {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div className={`flex gap-2 border ${borderCls} p-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <textarea
            ref={textareaRef}
            id="coach-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything... (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={isLoading}
            className={`flex-1 resize-none bg-transparent border-none outline-none text-sm py-1 px-2 ${inputBgCls} disabled:opacity-50`}
            style={{ ...mono, lineHeight: '1.6' }}
          />
          <button
            id="coach-send-button"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium border transition-colors duration-150 shrink-0 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-white hover:text-gray-900 hover:border-white disabled:opacity-30'
                : 'border-gray-800 text-gray-700 hover:bg-gray-900 hover:text-white disabled:opacity-30'
            }`}
            style={mono}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>

        <p
          className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`}
          style={mono}
        >
          AI responses are grounded in your training data but are not medical advice.
        </p>
      </div>
    </SectionWrapper>
  );
}
