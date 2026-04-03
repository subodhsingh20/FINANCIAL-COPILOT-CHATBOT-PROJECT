const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listConversationsByUserId,
  createConversation,
  updateConversation,
  deleteConversation,
} = require('../services/cloudantService');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const conversations = await listConversationsByUserId(req.user.userId);

    return res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    return res.status(500).json({ message: 'Unable to load conversations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, settings } = req.body;

    const conversation = await createConversation({
      userId: req.user.userId,
      title: typeof title === 'string' && title.trim() ? title.trim() : 'New chat',
      settings: {
        systemPrompt: typeof settings?.systemPrompt === 'string' && settings.systemPrompt.trim()
          ? settings.systemPrompt.trim()
          : undefined,
        temperature: typeof settings?.temperature === 'number'
          ? settings.temperature
          : undefined,
      },
      messages: [],
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error.message);
    return res.status(500).json({ message: 'Unable to create conversation' });
  }
});

router.patch('/:conversationId', async (req, res) => {
  try {
    const { title, settings } = req.body;
    const updatePayload = {};

    if (typeof title === 'string' && title.trim()) {
      updatePayload.title = title.trim();
    }

    if (settings && typeof settings === 'object') {
      updatePayload.settings = {};
      if (typeof settings.systemPrompt === 'string') {
        updatePayload.settings.systemPrompt = settings.systemPrompt.trim();
      }
      if (typeof settings.temperature === 'number') {
        updatePayload.settings.temperature = settings.temperature;
      }
    }

    const conversation = await updateConversation(req.params.conversationId, req.user.userId, updatePayload);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    return res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error.message);
    return res.status(500).json({ message: 'Unable to update conversation' });
  }
});

router.delete('/:conversationId', async (req, res) => {
  try {
    const deletedConversation = await deleteConversation(req.params.conversationId, req.user.userId);

    if (!deletedConversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error.message);
    return res.status(500).json({ message: 'Unable to delete conversation' });
  }
});

module.exports = router;
