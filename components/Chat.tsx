import React, { useState, useRef, useEffect } from 'react';
import { Send, User, ShieldAlert, Flag, Crown, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage, UserReport, Role } from '../types';

interface ChatProps {
  chatHistory: ChatMessage[];
  onSend: (text: string) => void;
  onReport: (suspect: string, reason: UserReport['reason']) => void;
  currentUser: string;
}

export const Chat: React.FC<ChatProps> = ({ chatHistory, onSend, onReport, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [reportingUser, setReportingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const getRoleBadge = (role: Role, vip?: boolean) => {
    if (role === 'OWNER') return <span className="bg-red-600 text-white text-[10px] px-1 rounded font-bold ml-1">DEV</span>;
    if (role === 'ADMIN') return <span className="bg-red-500 text-white text-[10px] px-1 rounded font-bold ml-1">ADMIN</span>;
    if (role === 'MOD') return <span className="bg-green-500 text-white text-[10px] px-1 rounded font-bold ml-1">MOD</span>;
    if (vip) return <span className="bg-orange-500 text-white text-[10px] px-1 rounded font-bold ml-1">VIP</span>;
    return null;
  };

  const getUsernameColor = (role: Role) => {
      if (role === 'OWNER') return 'text-red-500 font-black';
      if (role === 'ADMIN') return 'text-red-400 font-bold';
      if (role === 'MOD') return 'text-green-400 font-bold';
      return 'text-slate-300 font-bold';
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-20 right-4 z-40">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg border border-slate-600 transition-all active:scale-95"
          >
              {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-36 right-4 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 scale-100 h-96' : 'opacity-0 scale-90 h-0 pointer-events-none'}`}>
          
          {/* Header */}
          <div className="bg-slate-950 p-3 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> Global Chat
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </div>
          </div>

          {/* Report Modal Overlay */}
          {reportingUser && (
              <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Flag className="text-red-500" /> Report {reportingUser}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 w-full mb-4">
                      {['SCAM', 'TOXIC', 'BOT', 'EXPLOIT'].map((reason) => (
                          <button 
                            key={reason}
                            onClick={() => {
                                onReport(reportingUser, reason as any);
                                setReportingUser(null);
                                alert("Report submitted.");
                            }}
                            className="bg-slate-800 hover:bg-red-900/50 border border-slate-700 hover:border-red-500 text-xs text-white py-2 rounded transition-colors"
                          >
                              {reason}
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setReportingUser(null)} className="text-slate-500 text-xs hover:text-white underline">Cancel</button>
              </div>
          )}

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700">
              {chatHistory.length === 0 && (
                  <div className="text-center text-slate-600 text-xs italic mt-4">Welcome to global chat. Be nice!</div>
              )}
              {chatHistory.map(msg => (
                  <div key={msg.id} className="group relative hover:bg-slate-800/30 p-1 rounded transition-colors">
                      <div className="flex items-baseline gap-1 break-words">
                          <span 
                            className={`cursor-pointer hover:underline ${getUsernameColor(msg.role)}`}
                            onClick={() => msg.username !== currentUser && setReportingUser(msg.username)}
                            title={msg.username !== currentUser ? "Click to Report" : ""}
                          >
                              {msg.username}
                          </span>
                          {getRoleBadge(msg.role, msg.vip)}:
                          <span className="text-slate-300 text-sm ml-1 break-all">{msg.text}</span>
                      </div>
                      <span className="text-[9px] text-slate-600 ml-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
              ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-2 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={100}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                  <Send size={16} />
              </button>
          </form>
      </div>
    </>
  );
};