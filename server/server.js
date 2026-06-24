require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const customBotRoutes = require('./routes/customBot');

const app = express();
connectDB();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/custom-bot', customBotRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Relay server running on port ${PORT}`)
);
