import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesApi } from '../../api/messages';
import { useAuth } from '../../hooks/useAuth';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
  Users
} from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import UserAvatar from '../../components/UserAvatar';

const MessagingPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getConversations();
      setConversations(data);

      if (recipientParam) {
        const targetId = parseInt(recipientParam, 10);
        const existing = data.find(
          (c) => c.participant1_id === targetId || c.participant2_id === targetId
        );
        if (existing) {
          selectConversation(existing);
        } else {
          // If no existing conversation yet, create placeholder
          setSelectedConversation({
            id: null,
            other_user: { id: targetId, full_name: 'Recipient User', role: 'ALUMNI' },
          });
          setMessages([]);
        }
      } else if (data.length > 0 && !selectedConversation) {
        selectConversation(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    if (conv.id) {
      try {
        const history = await messagesApi.getConversationHistory(conv.id);
        setMessages(history);
      } catch (err) {
        console.error(err);
      }
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedConversation) return;

    const recipientId =
      selectedConversation.id === null
        ? selectedConversation.other_user.id
        : selectedConversation.participant1_id === user.id
        ? selectedConversation.participant2_id
        : selectedConversation.participant1_id;

    setIsSending(true);
    setSendError('');
    try {
      const sent = await messagesApi.sendMessage({
        recipient_id: recipientId,
        content: newMessage.trim(),
      });

      setMessages((prev) => [...prev, sent]);
      setNewMessage('');

      try {
        const data = await messagesApi.getConversations();
        setConversations(data);
        const active = data.find((c) => c.id === sent.conversation_id);
        if (active) setSelectedConversation(active);
      } catch (refreshError) {
        console.error('Message sent, but conversation list could not refresh:', refreshError);
      }
    } catch (err) {
      console.error('Failed to send:', err);
      setSendError(err.response?.data?.detail || 'Message not sent. Check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-label="Direct messages" className="cc-surface flex h-[calc(100dvh-200px)] min-h-[280px] flex-col overflow-hidden md:flex-row">
      {/* Conversations Sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} min-h-0 w-full flex-shrink-0 flex-col border-b border-slate-200 bg-slate-50 md:w-80 md:border-b-0 md:border-r`}>
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Messages</h2>
          <p className="text-[11px] text-slate-500">Mentorship & networking inquiries</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <Loader message="Loading chats..." size="small" />
          ) : conversations.length === 0 && !selectedConversation ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Message an alumni from their profile to start chatting!
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.other_user || {};
              const isSelected = selectedConversation?.id === conv.id;
              const lastMsg = conv.last_message;

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-white text-slate-800'
                  }`}
                >
                  <UserAvatar user={other} size="small" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold truncate">{other.full_name || 'User'}</p>
                      <span
                        className={`text-[9px] uppercase px-1 rounded font-bold ${
                          isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {other.role}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate mt-1 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-500'
                      }`}
                    >
                      {lastMsg ? lastMsg.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Thread Panel */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-white`}>
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <button type="button" onClick={() => setSelectedConversation(null)} aria-label="Back to messages" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <UserAvatar user={selectedConversation.other_user} size="small" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {selectedConversation.other_user?.full_name}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {selectedConversation.other_user?.department || 'DIU Department'} • {selectedConversation.other_user?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div ref={messagesContainerRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="h-8 w-8 text-indigo-200 mb-2" />
                  <p className="text-xs">Send a message to begin the conversation.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user.id;
                  const time = new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] break-words rounded-lg px-4 py-2.5 text-sm leading-5 sm:max-w-[75%] ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{time}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} aria-label="Send a message" className="border-t border-slate-200 p-3 sm:p-4">
              {sendError && <p role="alert" className="mb-2 text-xs font-medium text-rose-700">{sendError}</p>}
              <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="cc-control min-w-0 flex-1"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                aria-label="Send message"
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <EmptyState
              icon={MessageSquare}
              title="No Conversation Selected"
              description="Pick a conversation from the left or connect with an alumni mentor."
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MessagingPage;
