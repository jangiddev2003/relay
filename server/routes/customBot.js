const express = require('express');
const CustomBot = require('../models/CustomBot');
const Conversation = require('../models/Conversation');
const { getAIResponse } = require('../utils/aiClient');
const requireAuth = require('../middleware/auth');
const chatRateLimiter = require('../middleware/rateLimiter');
const { PDFParse } = require('pdf-parse');

// Helper for keyword-based retrieval (RAG) to prevent exceeding free-tier TPM limits
function getRelevantKnowledge(fullText, queryText, maxChars = 3000) {
  if (!fullText) return '';
  // Split into paragraphs
  const paragraphs = fullText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  // Tokenize user query into search keywords (longer than 3 chars)
  const keywords = queryText.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);
    
  if (keywords.length === 0) {
    // If no search terms, fallback to returning the beginning of the text
    return fullText.substring(0, maxChars);
  }
  
  // Score paragraphs based on matching keywords
  const scored = paragraphs.map(p => {
    const pLower = p.toLowerCase();
    let score = 0;
    keywords.forEach(word => {
      if (pLower.includes(word)) {
        score += 1;
      }
    });
    return { paragraph: p, score };
  });
  
  // Sort by highest keyword matches first
  const matches = scored.filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.paragraph);
    
  const results = matches.length > 0 ? matches : paragraphs;
  
  // Assemble content up to maximum characters limit
  let output = '';
  for (const p of results) {
    if ((output + p).length > maxChars) {
      break;
    }
    output += p + '\n\n';
  }
  return output.trim();
}

const router = express.Router();

// All custom bot routes require authentication
router.use(requireAuth);

// Get all custom bots created by the user
router.get('/', async (req, res) => {
  try {
    const bots = await CustomBot.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ bots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parse attached instructions PDF to autofill form
router.post('/parse-instruction-pdf', async (req, res) => {
  const { pdfBase64 } = req.body;
  if (!pdfBase64) {
    return res.status(400).json({ error: 'No PDF data provided' });
  }

  try {
    const buffer = Buffer.from(pdfBase64, 'base64');
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = parsed.text;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the PDF' });
    }

    const extractionPrompt = `You are a bot creator assistant. Analyze the provided text from a bot instructions file and extract the following details to create an AI assistant:
1. Bot Name
2. Description
3. Personality
4. Rules/Instructions

Response format: Respond with a JSON object containing the keys "name", "description", "personality", and "rules". Do not include any markdown fences or explanation. Return ONLY the JSON object. Example:
{"name": "Copywriter", "description": "Helps write marketing copy", "personality": "creative", "rules": "use friendly tone"}`;

    const aiResponse = await getAIResponse(extractionPrompt, text);
    
    // Clean potential markdown formatting
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const data = JSON.parse(cleanJson);
    res.json(data);
  } catch (err) {
    console.error("PDF PARSE ERROR:", err);
    res.status(500).json({ error: 'Failed to parse PDF', details: err.message });
  }
});

// Create a new custom bot (supports knowledge base PDF attachment)
router.post('/', async (req, res) => {
  const { name, description, personality, rules, knowledgePdfBase64, knowledgePdfName } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Bot name is required' });
  }

  try {
    let knowledgeText = '';
    if (knowledgePdfBase64) {
      const buffer = Buffer.from(knowledgePdfBase64, 'base64');
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      knowledgeText = parsed.text || '';
    }

    const newBot = await CustomBot.create({
      userId: req.userId,
      name: name.trim(),
      description: (description || '').trim(),
      personality: (personality || '').trim(),
      rules: (rules || '').trim(),
      knowledgeText,
      knowledgePdfName
    });
    res.status(201).json({ bot: newBot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific custom bot's details
router.get('/:botId', async (req, res) => {
  try {
    const bot = await CustomBot.findOne({ _id: req.params.botId, userId: req.userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json({ bot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active conversation or by ID for a specific custom bot
router.get('/:botId/chat', async (req, res) => {
  const { botId } = req.params;
  const { conversationId } = req.query;

  try {
    const bot = await CustomBot.findOne({ _id: botId, userId: req.userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    let convo;
    const dbBotType = `custom_${botId}`;
    if (conversationId && conversationId !== 'null' && conversationId !== 'undefined') {
      convo = await Conversation.findOne({ _id: conversationId, userId: req.userId, botType: dbBotType });
    } else {
      convo = await Conversation.findOne({ userId: req.userId, botType: dbBotType }).sort({ updatedAt: -1 });
    }

    res.json({
      conversationId: convo ? convo._id : null,
      messages: convo ? convo.messages : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation history list for a specific custom bot
router.get('/:botId/history', async (req, res) => {
  const { botId } = req.params;

  try {
    const bot = await CustomBot.findOne({ _id: botId, userId: req.userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const dbBotType = `custom_${botId}`;
    const convos = await Conversation.find({ userId: req.userId, botType: dbBotType })
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

// Post a new message to a custom bot (includes scope-checking)
router.post('/:botId/chat', chatRateLimiter, async (req, res) => {
  const { botId } = req.params;
  const { message, conversationId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const bot = await CustomBot.findOne({ _id: botId, userId: req.userId });
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const dbBotType = `custom_${botId}`;
    let convo;
    if (conversationId && conversationId !== 'null' && conversationId !== 'undefined') {
      convo = await Conversation.findOne({ _id: conversationId, userId: req.userId, botType: dbBotType });
    }

    if (!convo) {
      convo = new Conversation({ userId: req.userId, botType: dbBotType, messages: [] });
    }

    convo.messages.push({ role: 'user', text: message });

    // Step 1: Specialty Scope Classification
    const scopeClassificationPrompt = `You are a specialty checker for a custom AI bot named "${bot.name}".
Description of what the bot does:
${bot.description || ''}

Rules / Instructions:
${bot.rules || ''}

Determine if the user's query is relevant to the bot's specialty/domain.
If the query is relevant and in-scope, respond with ONLY:
IN_SCOPE
If the query is not relevant, respond with ONLY:
OUT_OF_SCOPE

Do not include any other explanation or punctuation. Output only IN_SCOPE or OUT_OF_SCOPE.`;

    const scopeCheckResult = await getAIResponse(scopeClassificationPrompt, message);
    const isInScope = scopeCheckResult.trim().toUpperCase().includes('IN_SCOPE');

    let replyText;
    let outOfScopeFlag = false;
    let assignedBotCode = bot.name;

    if (isInScope) {
      // Build dynamic system prompt (incorporating Knowledge PDF text if uploaded)
      let customPrompt = `You are ${bot.name}.
Description: ${bot.description || ''}
Personality: ${bot.personality || ''}
Rules: ${bot.rules || ''}`;

      if (bot.knowledgeText) {
        const relevantKnowledge = getRelevantKnowledge(bot.knowledgeText, message);
        if (relevantKnowledge) {
          customPrompt += `\n\nHere is detailed reference knowledge you possess:\n=== KNOWLEDGE BASE ===\n${relevantKnowledge}\n======================`;
        }
      }

      replyText = await getAIResponse(customPrompt, message);
    } else {
      // Out of Scope flow
      outOfScopeFlag = true;
      assignedBotCode = 'Outside Specialty';

      const generalAssistantPrompt = `You are a helpful and versatile general AI assistant. Provide a helpful, clear, and concise answer to the user's question.`;
      const generalAIAnswer = await getAIResponse(generalAssistantPrompt, message);

      replyText = `⚠️ This question appears to be outside this bot's specialty.

This bot specializes in:
* ${bot.description || bot.name}

Relay Answer:
${generalAIAnswer}`;
    }

    convo.messages.push({
      role: 'bot',
      text: replyText,
      botCode: assignedBotCode,
      outOfScope: outOfScopeFlag
    });

    convo.updatedAt = new Date();
    await convo.save();

    res.json({
      conversationId: convo._id,
      reply: replyText,
      messages: convo.messages
    });
  } catch (err) {
    console.error("CUSTOM CHAT ERROR:", err);
    res.status(502).json({
      error: 'Failed to generate response',
      details: err.message
    });
  }
});

// Rename custom bot conversation
router.put('/:botId/:conversationId', async (req, res) => {
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

// Delete custom bot conversation
router.delete('/:botId/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const result = await Conversation.deleteOne({ _id: conversationId, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete custom bot (and all its conversations)
router.delete('/:botId', async (req, res) => {
  const { botId } = req.params;
  try {
    const botResult = await CustomBot.deleteOne({ _id: botId, userId: req.userId });
    if (botResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Cascading delete for conversations associated with this custom bot
    const dbBotType = `custom_${botId}`;
    await Conversation.deleteMany({ userId: req.userId, botType: dbBotType });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
