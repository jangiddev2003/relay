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

router.get('/:botType/history', async (req, res) => {
  const { botType } = req.params;
  if (!BOTS[botType]) return res.status(404).json({ error: 'Unknown bot type' });
  
  try {
    const convos = await Conversation.find({ userId: req.userId, botType })
      .select('_id title messages updatedAt')
      .sort({ updatedAt: -1 });
      
    const list = convos.map(c => {
      const firstUserMsg = c.messages.find(m => m.role === 'user');
      const resolvedTitle = c.title || (firstUserMsg ? firstUserMsg.text : 'New Chat');
      return {
        id: c._id,
        title: resolvedTitle.length > 35 ? resolvedTitle.substring(0, 35) + '...' : resolvedTitle,
        updatedAt: c.updatedAt
      };
    });
    
    res.json({ history: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:botType', async (req, res) => {
  const { botType } = req.params;
  const { conversationId } = req.query;
  if (!BOTS[botType]) return res.status(404).json({ error: 'Unknown bot type' });
  
  try {
    let convo;
    if (conversationId && conversationId !== 'null' && conversationId !== 'undefined') {
      convo = await Conversation.findOne({ _id: conversationId, userId: req.userId });
    } else {
      convo = await Conversation.findOne({ userId: req.userId, botType }).sort({ updatedAt: -1 });
    }
    res.json({
      conversationId: convo ? convo._id : null,
      messages: convo ? convo.messages : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:botType', chatRateLimiter, async (req, res) => {
  const { botType } = req.params;
  const { message, conversationId } = req.body;
  const bot = BOTS[botType];
  if (!bot) return res.status(404).json({ error: 'Unknown bot type' });
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

  try {
    let convo;
    if (conversationId && conversationId !== 'null' && conversationId !== 'undefined') {
      convo = await Conversation.findOne({ _id: conversationId, userId: req.userId });
    }
    
    if (!convo) {
      convo = new Conversation({ userId: req.userId, botType, messages: [] });
    }

    convo.messages.push({ role: 'user', text: message });

    let selectedBotType = botType;
    let selectedBot = bot;
    let isRouted = botType === 'routed';
    let matchedCategory = bot.code;

    if (isRouted) {
      const classificationPrompt = `You are an intent router for an AI assistant platform.
Your job is to classify the user's message into exactly one of these five categories:
- knowledge: General knowledge, explanations of concepts, history, science, etc.
- reasoning: Complex logical puzzles, step-by-step reasoning problems, planning, decision-making.
- coding: Writing code, debugging, explaining code, algorithms.
- maths: Solving mathematical equations, calculus, arithmetic, word problems.
- news: Current events, latest updates, headlines.

Response format: Respond with ONLY the category name in lowercase: knowledge, reasoning, coding, maths, or news. Do not include any other text, explanation, or punctuation.`;

      const categoryResponse = await getAIResponse(classificationPrompt, message);
      const category = categoryResponse.trim().toLowerCase();

      if (['knowledge', 'reasoning', 'coding', 'maths', 'news'].includes(category)) {
        selectedBotType = category;
        selectedBot = BOTS[category];
        matchedCategory = selectedBot.code;
      } else {
        selectedBotType = 'knowledge';
        selectedBot = BOTS['knowledge'];
        matchedCategory = selectedBot.code;
      }
    }

    let replyText;
    if (selectedBotType === 'news') {
      const headlines = await getTopHeadlines();
      replyText = await getAIResponse(
        selectedBot.systemPrompt,
        `Here are the current headlines:\n${headlines}\n\nUser request: ${message}`
      );
    } else {
      replyText = await getAIResponse(selectedBot.systemPrompt, message);
    }

    convo.messages.push({ role: 'bot', text: replyText, botCode: matchedCategory });
    convo.updatedAt = new Date();
    await convo.save();

    res.json({
      conversationId: convo._id,
      reply: replyText,
      messages: convo.messages
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(502).json({
      error: 'The AI service failed to respond',
      details: err.message
    });
  }
});

router.put('/:botType/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title cannot be empty' });
  try {
    const convo = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId: req.userId },
      { title: title.trim() },
      { new: true }
    );
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true, title: convo.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:botType/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const result = await Conversation.deleteOne({ _id: conversationId, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
