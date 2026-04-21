import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { apiUrl } from '../lib/api';

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful, accurate, practical, and concise chat assistant. Use markdown when it improves readability.';
const DEFAULT_TEMPERATURE = 0.7;

export const ChatContext = createContext();

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getTitleFromMessage(content) {
  const cleaned = content.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'Untitled chat';
  }

  return cleaned.split(' ').slice(0, 6).join(' ');
}

function normalizeConversation(conversation) {
  return {
    ...conversation,
    id: conversation._id || conversation.id,
    messages: Array.isArray(conversation.messages)
      ? conversation.messages.map((message) => ({
          ...message,
          id: message._id || message.id || createId(message.role || 'message'),
        }))
      : [],
  };
}

async function authorizedFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please log in again to continue.');
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setCurrentConversationId(null);
      setStatus('idle');
      setError(null);
      return;
    }

    let isCancelled = false;

    const loadConversations = async () => {
      try {
        setStatus('loading');
        const data = await authorizedFetch('/api/conversations', { method: 'GET' });
        if (isCancelled) {
          return;
        }

        const normalized = data.map(normalizeConversation);
        setConversations(normalized);
        setCurrentConversationId((previous) => previous || normalized[0]?.id || null);
      } catch (requestError) {
        if (!isCancelled) {
          setError(requestError.message || 'Unable to load conversations');
        }
      } finally {
        if (!isCancelled) {
          setStatus('idle');
        }
      }
    };

    loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === currentConversationId) || null,
    [conversations, currentConversationId]
  );

  const clearError = () => {
    setError(null);
  };

  const createNewConversation = async (seedMessage = '') => {
    const title = seedMessage ? getTitleFromMessage(seedMessage) : 'New chat';
    const payload = {
      title,
      settings: {
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        temperature: DEFAULT_TEMPERATURE,
      },
    };

    const savedConversation = normalizeConversation(await authorizedFetch('/api/conversations', {
      method: 'POST',
      body: payload,
    }));

    setConversations((previous) => [savedConversation, ...previous]);
    setCurrentConversationId(savedConversation.id);
    setError(null);
    return savedConversation;
  };

  const selectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setError(null);
  };

  const deleteConversation = async (conversationId) => {
    try {
      await authorizedFetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      setConversations((previous) => {
        const next = previous.filter((conversation) => conversation.id !== conversationId);
        if (currentConversationId === conversationId) {
          setCurrentConversationId(next[0]?.id || null);
        }
        return next;
      });
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete conversation');
    }
  };

  const renameConversation = async (conversationId, title) => {
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    try {
      const updatedConversation = normalizeConversation(await authorizedFetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        body: { title: nextTitle },
      }));

      setConversations((previous) => previous.map((conversation) => (
        conversation.id === conversationId ? updatedConversation : conversation
      )));
    } catch (requestError) {
      setError(requestError.message || 'Unable to rename conversation');
    }
  };

  const requestAssistantReply = async ({ activeConversation, submittedMessages, nextMessages, placeholderMessage, nextTitle }) => {
    setStatus('loading');
    setError(null);

    setConversations((previous) => {
      const exists = previous.some((conversation) => conversation.id === activeConversation.id);
      const updatedConversation = {
        ...activeConversation,
        title: nextTitle,
        updatedAt: new Date().toISOString(),
        messages: nextMessages,
      };

      return exists
        ? previous.map((conversation) => (
            conversation.id === activeConversation.id ? updatedConversation : conversation
          ))
        : [updatedConversation, ...previous];
    });

    setCurrentConversationId(activeConversation.id);

    try {
      const data = await authorizedFetch('/api/chat', {
        method: 'POST',
        body: {
          conversationId: activeConversation.id,
          title: nextTitle,
          messages: submittedMessages.map((message) => ({
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
            model: message.model,
            provider: message.provider,
            usage: message.usage,
          })),
          systemPrompt: activeConversation.settings.systemPrompt,
          temperature: activeConversation.settings.temperature,
        },
      });

      const savedConversation = normalizeConversation(data.conversation);

      setConversations((previous) => previous.map((conversation) => (
        conversation.id === activeConversation.id ? savedConversation : conversation
      )));
    } catch (requestError) {
      setError(requestError.message || 'Unable to get a response right now');
      setConversations((previous) => previous.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation;
        }

        return {
          ...conversation,
          updatedAt: new Date().toISOString(),
          messages: conversation.messages.filter((message) => message.id !== placeholderMessage.id),
        };
      }));
    } finally {
      setStatus('idle');
    }
  };

  const sendMessage = async (content) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || status === 'loading') {
      return;
    }

    const activeConversation = currentConversation || await createNewConversation(trimmedContent);
    const now = new Date().toISOString();
    const userMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmedContent,
      createdAt: now,
    };

    const placeholderMessage = {
      id: createId('assistant'),
      role: 'assistant',
      content: '',
      createdAt: now,
      status: 'streaming',
    };

    const nextMessages = [...activeConversation.messages, userMessage, placeholderMessage];
    const nextTitle = activeConversation.messages.length === 0
      ? getTitleFromMessage(trimmedContent)
      : activeConversation.title;

    await requestAssistantReply({
      activeConversation: {
        ...activeConversation,
        title: nextTitle,
      },
      submittedMessages: [...activeConversation.messages, userMessage],
      nextMessages,
      placeholderMessage,
      nextTitle,
    });
  };

  const regenerateLastReply = async () => {
    if (!currentConversation || status === 'loading') {
      return;
    }

    const messages = [...currentConversation.messages];
    const lastAssistantIndex = [...messages].reverse().findIndex((message) => message.role === 'assistant');
    if (lastAssistantIndex === -1) {
      return;
    }

    const absoluteAssistantIndex = messages.length - 1 - lastAssistantIndex;
    const previousUserMessage = messages
      .slice(0, absoluteAssistantIndex)
      .reverse()
      .find((message) => message.role === 'user');

    if (!previousUserMessage) {
      return;
    }

    const trimmedMessages = messages.slice(0, absoluteAssistantIndex);
    const now = new Date().toISOString();
    const placeholderMessage = {
      id: createId('assistant'),
      role: 'assistant',
      content: '',
      createdAt: now,
      status: 'streaming',
    };

    await requestAssistantReply({
      activeConversation: {
        ...currentConversation,
        messages: trimmedMessages,
        updatedAt: now,
      },
      submittedMessages: trimmedMessages,
      nextMessages: [...trimmedMessages, placeholderMessage],
      placeholderMessage,
      nextTitle: currentConversation.title || getTitleFromMessage(previousUserMessage.content),
    });
  };

  const startFreshChat = async () => {
    await createNewConversation();
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        currentConversationId,
        status,
        error,
        createNewConversation,
        startFreshChat,
        selectConversation,
        deleteConversation,
        renameConversation,
        sendMessage,
        regenerateLastReply,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
