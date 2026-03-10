import express from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

const router = express.Router();

// Get conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find().populate('contactId').sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
