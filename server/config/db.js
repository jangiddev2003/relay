const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Drop old unique index for conversations if it exists to allow multiple chats per botType
    try {
      await mongoose.connection.db.collection('conversations').dropIndex('userId_1_botType_1');
      console.log('Dropped old unique index userId_1_botType_1');
    } catch (indexErr) {
      // Index might not exist, which is fine
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
