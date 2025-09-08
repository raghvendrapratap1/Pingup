import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import googleAuth from './middleware/googleAuth.js';
import userRoutes from "./routes/userRoutes.js";
import errorHandler from './middleware/errorHandler.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import geminiRouter from './routes/geminiRoutes.js';
import storyQueue from './queues/storyQueue.js';
import imagekitRouter from './routes/imagekitRoutes.js';

const app = express();

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Socket.IO setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Socket.IO auth
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.userId = userId;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    socket.join(`user_${userId}`);
  });

  socket.on('typing', ({ to_user_id }) => {
    socket.to(`user_${to_user_id}`).emit('userTyping', {
      from_user_id: socket.userId
    });
  });

  socket.on('stopTyping', ({ to_user_id }) => {
    socket.to(`user_${to_user_id}`).emit('userStopTyping', {
      from_user_id: socket.userId
    });
  }); 

  socket.on('disconnect', () => {
    // User disconnected
  });
});

app.set('io', io);

// ✅ CORS fix
app.use(cors({
    origin: process.env.FRONTEND_URL || "https://pingup-front.vercel.app",
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://pingup-back.vercel.app/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ["email", "profile"],
    prompt: "select_account"
}));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: (process.env.FRONTEND_URL || 'https://pingup-front.vercel.app') + '/login' }),
  googleAuth,
  (req, res) => {
    res.redirect((process.env.FRONTEND_URL || 'https://pingup-front.vercel.app') + '/feed');
  }
);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);
app.use('/api/imagekit', imagekitRouter);
await connectDB();

// Gemini API
app.use('/api/gemini', geminiRouter);

// Bull Queue
try {
    storyQueue.on('completed', (job) => {});
    storyQueue.on('failed', (job, err) => {});
    storyQueue.on('error', (error) => {});
} catch (error) {}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await storyQueue.close();
    server.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
    await storyQueue.close();
    server.close(() => process.exit(0));
});
