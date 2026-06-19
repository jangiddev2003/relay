const express = require('express');
const Conversation = require('../models/Conversation');
const BOTS = require('../utils/botConfig');
const { getAIResponse } = require('../utils/aiClient');
const { getTopHeadlines } = require('../utils/newsClient');
const requireAuth = require('../middleware/auth');
const chatRateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const list = Object.entries(BOTS).map(([id, b]) => ({ id, name: b.name }));
  res.json({ bots: list });
});

router.get('/:botType', async (req, res) => {
  const { botType } = req.params;
  if (!BOTS[botType]) return res.status(404).json({ error: 'Unknown bot type' });
  const convo = await Conversation.findOne({ userId: req.userId, botType });
  res.json({ messages: convo ? convo.messages : [] });
});

router.post('/:botType', chatRateLimiter, async (req, res) => {
  const { botType } = req.params;
  const { message } = req.body;
  const bot = BOTS[botType];
  if (!bot) return res.status(404).json({ error: 'Unknown bot type' });
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

  try {
    let convo = await Conversation.findOne({ userId: req.userId, botType });
    if (!convo) convo = new Conversation({ userId: req.userId, botType, messages: [] });

    convo.messages.push({ role: 'user', text: message });

    let replyText;
    if (botType === 'news') {
      const headlines = await getTopHeadlines();
      replyText = await getAIResponse(
        bot.systemPrompt,
        `Here are the current headlines:\n${headlines}\n\nUser request: ${message}`
      );
    } else {
      replyText = await getAIResponse(bot.systemPrompt, message);
    }

    convo.messages.push({ role: 'bot', text: replyText });
    convo.updatedAt = new Date();
    await convo.save();

    res.json({ reply: replyText, messages: convo.messages });
  } catch (err) {
    res.status(502).json({ error: 'The AI service failed to respond', details: err.message });
  }
});

module.exports = router;
