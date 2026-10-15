import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { subscribeToChatMessages, sendChatMessage, ChatMessage } from '../../utils/firebase';
import { soundManager } from '../../utils/sound';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToChatMessages((incoming) => {
      setMessages(incoming);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => unsub();
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendChatMessage(user, inputMessage);
      setInputMessage('');
      try {
        soundManager.playCorrect();
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg ios27-glass-card shadow-2xl relative flex flex-col h-[520px] animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1CB0F6] to-indigo-500 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Sibaq Live Learner Chat
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chat with fellow Spanish learners via Firebase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {!user ? (
            <div className="text-center py-16 px-4 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-400 opacity-60" />
              <h4 className="text-base font-black text-slate-800 dark:text-white">
                Sign in to join the conversation
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Connect with your Google account to chat and share study milestones with other Sibaq learners in real time.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#1CB0F6]" />
              <p className="text-sm font-bold">No messages yet</p>
              <p className="text-xs mt-1">Be the first learner to say ¡Hola! in the chat room.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userId === user?.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.userPhoto ? (
                    <img
                      src={msg.userPhoto}
                      alt={msg.userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {msg.userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`space-y-1 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.userName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs font-medium shadow-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#1CB0F6] text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        {user ? (
          <form
            onSubmit={handleSend}
            className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-white/20 dark:border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message to fellow learners..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1CB0F6] to-sky-500 text-white font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-white/20 dark:border-white/10 text-center text-xs text-slate-400 font-bold">
            Sign in with Google in your profile to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};
