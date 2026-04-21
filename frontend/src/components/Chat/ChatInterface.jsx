import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const QUICK_PROMPTS = [
  'Help me write a text message',
  'What should I make for dinner?',
  'Give me a simple daily plan',
  'Tell me a quick joke',
];

const ChatInterface = () => {
  const {
    conversations,
    currentConversation,
    currentConversationId,
    status,
    error,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    regenerateLastReply,
    clearError,
  } = useContext(ChatContext);
  const { user, logout } = useContext(AuthContext);

  const [draft, setDraft] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const sortedConversations = useMemo(
    () => [...conversations].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)),
    [conversations]
  );

  const conversationMessages = useMemo(() => currentConversation?.messages || [], [currentConversation]);

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(error);
    clearError();
  }, [clearError, error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, status]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      if (transcript.trim()) {
        setDraft(transcript.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleSendMessage = async (nextDraft = draft) => {
    const safeDraft = typeof nextDraft === 'string' ? nextDraft : draft;
    const trimmed = safeDraft.trim();
    if (!trimmed) {
      return;
    }

    setDraft('');
    await sendMessage(trimmed);
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied');
    } catch {
      toast.error('Unable to copy right now');
    }
  };

  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.info('Voice input is not available in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.start();
    setIsListening(true);
  };

  const handleCreateConversation = () => {
    createNewConversation();
    setSidebarOpen(false);
  };

  const handleStartRename = (conversation) => {
    setEditingTitleId(conversation.id);
    setTitleDraft(conversation.title);
  };

  const handleSaveRename = () => {
    if (!editingTitleId) {
      return;
    }

    renameConversation(editingTitleId, titleDraft);
    setEditingTitleId(null);
    setTitleDraft('');
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.88),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.24),_transparent_30%),linear-gradient(180deg,_#f7fafc_0%,_#eaf1ff_100%)] pt-16 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)] dark:text-slate-100">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[1px] md:hidden"
        />
      ) : null}

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1700px]">
        <aside
          className={`fixed inset-y-16 left-0 z-40 w-[min(88vw,320px)] border-r border-white/45 bg-white/72 shadow-[0_24px_80px_rgba(148,163,184,0.22)] backdrop-blur-2xl transition md:static md:w-[280px] md:translate-x-0 dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_28px_90px_rgba(2,6,23,0.55)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-white/45 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center justify-between md:hidden">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Menu
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <button
                type="button"
                onClick={handleCreateConversation}
                className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(30,41,59,0.22)] transition hover:brightness-110 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 dark:text-slate-950"
              >
                New chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recent
              </div>
              <div className="space-y-1">
                {sortedConversations.length === 0 ? (
                  <div className="rounded-2xl border border-white/55 bg-white/65 px-3 py-4 text-sm text-slate-500 shadow-[0_12px_30px_rgba(148,163,184,0.14)] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    Start a new conversation to see it here.
                  </div>
                ) : (
                  sortedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group rounded-xl ${
                        conversation.id === currentConversationId
                          ? 'border border-white/60 bg-white/82 shadow-[0_16px_32px_rgba(148,163,184,0.16)] dark:border-white/10 dark:bg-white/10'
                          : 'border border-transparent hover:border-white/40 hover:bg-white/58 dark:hover:border-white/10 dark:hover:bg-white/5'
                      }`}
                    >
                      {editingTitleId === conversation.id ? (
                        <div className="space-y-2 p-3">
                          <input
                            value={titleDraft}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            className="w-full rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-slate-950/70 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveRename}
                              className="rounded-xl bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 px-3 py-1.5 text-xs font-semibold text-white dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 dark:text-slate-950"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTitleId(null)}
                              className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              selectConversation(conversation.id);
                              setSidebarOpen(false);
                            }}
                            className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left"
                          >
                            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {conversation.title}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {conversation.messages.length} messages
                            </div>
                          </button>
                          <div className="flex opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleStartRename(conversation)}
                              className="rounded-lg px-2 py-2 text-xs text-slate-500 transition hover:bg-white/85 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteConversation(conversation.id)}
                              className="rounded-lg px-2 py-2 text-xs text-slate-500 transition hover:bg-white/85 hover:text-rose-600 dark:hover:bg-white/10"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/45 p-4 text-sm dark:border-white/10">
              <div className="truncate font-medium text-slate-800 dark:text-slate-100">{user?.username || user?.email}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">OpenRouter connected</div>
              <button
                type="button"
                onClick={logout}
                className="mt-3 w-full rounded-2xl border border-slate-200/90 bg-white/78 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white/46 backdrop-blur-xl dark:bg-slate-950/20">
          <header className="flex items-center justify-between border-b border-white/45 bg-white/48 px-4 py-3 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-slate-950/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="rounded-xl border border-slate-200/90 bg-white/85 px-3 py-2 text-sm text-slate-700 shadow-sm md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                Menu
              </button>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentConversation?.title || 'New chat'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  OpenRouter
                </div>
              </div>
            </div>

            <div />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-6 md:px-6">
              <MessageList
                messages={conversationMessages}
                quickPrompts={QUICK_PROMPTS}
                onPromptClick={setDraft}
                onCopy={handleCopy}
                onRegenerate={regenerateLastReply}
              />
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-white/45 bg-white/38 px-4 py-4 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-slate-950/10">
            <div className="mx-auto w-full max-w-4xl">
              <MessageInput
                draft={draft}
                setDraft={setDraft}
                onSubmit={handleSendMessage}
                isListening={isListening}
                onToggleListening={handleToggleListening}
                disabled={status === 'loading'}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatInterface;
