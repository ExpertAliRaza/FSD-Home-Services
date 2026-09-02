import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Database } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const SUGGESTIONS = [
  'Total requests this month',
  'How many approved workers?',
  'Revenue last 7 days',
  'Cancelled orders this month',
  'Top services this month',
  'Open complaints',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salam! Main aapka admin AI assistant hoon. FSD Home Services ke live data ke baray mein sawal poochein.',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e, preset) => {
    if (e?.preventDefault) e.preventDefault();
    const userMsg = (preset || input).trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Keep existing history for context, but only user/assistant turns.
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMsg, history }
      });

      if (error) {
        throw new Error(error.message);
      }

      const reply = data?.reply || 'No response.';
      const sources = Array.isArray(data?.sources) ? data.sources : [];
      // Legacy path: the old function returned error text inside reply.
      if (typeof reply === 'string' && /^(Groq API Error|Internal Error)/.test(reply)) {
        setMessages(prev => [...prev, { role: 'assistant', content: reply, sources: [] }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: reply, sources }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Error: ' + err.message, sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg shadow-brand-700/30 transition-transform hover:scale-110 active:scale-95"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[80vh] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
{/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-brand-700 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} />
          <h3 className="font-bold">Admin Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 text-brand-100 hover:bg-brand-600 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        <div className="flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-brand-700 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                {msg.role === 'assistant' && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.sources.map((src) => (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700"
                      >
                        <Database size={10} />
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[88%] items-center gap-2 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
{/* Quick suggestions */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-3 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => sendMessage(null, text)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about live data..."
            className="h-10 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm outline-none focus:border-brand-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            <Send size={16} className="-ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}