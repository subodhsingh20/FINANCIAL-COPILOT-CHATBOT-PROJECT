const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generateChatCompletion, generateConversationTitle } = require('../services/aiService');
const {
  createConversation,
  updateConversation,
} = require('../services/cloudantService');

const router = express.Router();

function shouldGenerateTitle(title) {
  if (!title) {
    return true;
  }

  const normalizedTitle = title.trim().toLowerCase();
  return normalizedTitle === 'new chat' || normalizedTitle === 'untitled chat';
}

function buildLocalConversation({
  conversationId,
  userId,
  title,
  systemPrompt,
  temperature,
  normalizedMessages,
  assistantMessage,
}) {
  const now = new Date().toISOString();
  return {
    _id: conversationId || `conversation-local-${Date.now()}`,
    userId,
    title,
    settings: {
      systemPrompt,
      temperature,
    },
    messages: [...normalizedMessages, assistantMessage],
    createdAt: now,
    updatedAt: now,
  };
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversationId, messages = [], systemPrompt, temperature, title } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'At least one message is required' });
    }

    const finalSystemPrompt = typeof systemPrompt === 'string' && systemPrompt.trim()
      ? systemPrompt.trim()
      : 'You are a helpful, concise, practical, and honest chat assistant. Format clearly and prefer actionable guidance.';

    const completion = await generateChatCompletion({
      messages,
      systemPrompt: finalSystemPrompt,
      temperature,
    });

    let conversation = null;
    const normalizedMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt || new Date().toISOString(),
      model: message.model || null,
      provider: message.provider || null,
      usage: message.usage || null,
    }));

    const assistantMessage = {
      role: 'assistant',
      content: completion.content,
      createdAt: new Date().toISOString(),
      model: completion.model,
      provider: completion.provider,
      usage: completion.usage,
    };

    const generatedTitle = shouldGenerateTitle(title)
      ? await generateConversationTitle({ messages: [...normalizedMessages, assistantMessage] })
      : null;

    const resolvedTitle = generatedTitle || (typeof title === 'string' && title.trim() ? title.trim() : 'New chat');
    const conversationPayload = {
      userId: req.user.userId,
      title: resolvedTitle,
      settings: {
        systemPrompt: finalSystemPrompt,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
      messages: [...normalizedMessages, assistantMessage],
    };

    try {
      if (conversationId) {
        conversation = await updateConversation(conversationId, req.user.userId, {
          title: resolvedTitle,
          settings: conversationPayload.settings,
          messages: conversationPayload.messages,
        });
      } else {
        conversation = await createConversation(conversationPayload);
      }
    } catch (saveError) {
      console.warn('Conversation save failed, returning local chat response:', saveError.message);
      conversation = buildLocalConversation({
        conversationId,
        userId: req.user.userId,
        title: resolvedTitle,
        systemPrompt: finalSystemPrompt,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        normalizedMessages,
        assistantMessage,
      });
    }

    if (!conversation) {
      conversation = buildLocalConversation({
        conversationId,
        userId: req.user.userId,
        title: resolvedTitle,
        systemPrompt: finalSystemPrompt,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        normalizedMessages,
        assistantMessage,
      });
    }

    return res.json({
      reply: completion.content,
      model: completion.model,
      provider: completion.provider,
      usage: completion.usage,
      conversation,
    });
  } catch (error) {
    console.error('Error in /api/chat:', error.message);
    return res.status(500).json({
      message: error.message || 'Unable to generate a response right now',
    });
  }
});

module.exports = router;
