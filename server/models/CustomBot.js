const mongoose = require('mongoose');

const customBotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  personality: { type: String },
  rules: { type: String },
  knowledgeText: { type: String },
  knowledgePdfName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomBot', customBotSchema);
