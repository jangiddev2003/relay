const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  botCode: { type: String },
  outOfScope: { type: Boolean },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  botType: { type: String, required: true },
  title: { type: String },
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.index({ userId: 1, botType: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
