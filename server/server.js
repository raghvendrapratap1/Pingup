import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
dotenv.config();
console.log("Current Working Dir:", process.cwd());

console.log("PUBLIC KEY:", process.env.IMAGEKIT_PUBLIC_KEY); // test

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import googleAuth from './middleware/googleAuth.js';
// import getConnection from './utils/getConnections.js';
import userRoutes from "./routes/userRoutes.js";
import errorHandler from './middleware/errorHandler.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import geminiRouter from './routes/geminiRoutes.js';
import storyQueue from './queues/storyQueue.js';

// console.log("Current dir:", process.cwd());
// console.log("MongoDB URL:", process.env.MONGODB_URL);

const app = express();

// Test route to check if server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Socket.IO setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Socket.IO connection handling
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
  console.log('User connected:', socket.userId);
  
  // Join user's personal room
  socket.on('join', ({ userId }) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle typing events
  socket.on('typing', ({ to_user_id }) => {
    // Emit to the recipient that user is typing
    socket.to(`user_${to_user_id}`).emit('userTyping', {
      from_user_id: socket.userId
    });
  });
  
  socket.on('stopTyping', ({ to_user_id }) => {
    // Emit to the recipient that user stopped typing
    socket.to(`user_${to_user_id}`).emit('userStopTyping', {
      from_user_id: socket.userId
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Make io available to routes
app.set('io', io);

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))
app.use(cookieParser());

// Serve static files from client build directory
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// Handle favicon.ico requests specifically
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response for favicon
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:4000/auth/google/callback'
},(accessToken,refreshToken,profile,done)=>{
    console.log(profile);
    return done(null,profile);
}))

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

app.get('/auth/google',passport.authenticate('google',{
    scope:["email","profile"],
    prompt:"select_account"
}))

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  googleAuth,
  (req, res) => {
    // login success → redirect to Feed page
    res.redirect('http://localhost:5173/feed'); // feed route explicitly define karo
  }
);


app.use(errorHandler);


app.use('/api/user',userRoutes)
app.use('/api/post',postRouter)
app.use('/api/story',storyRouter)
app.use('/api/message',messageRouter)
// get Connection();
await connectDB();


// gemini  api call 
app.use('/api/gemini',geminiRouter);

// app.use('/api/inngest',serve({ client: inngest, functions }))

// Initialize Bull queue
storyQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

storyQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});

storyQueue.on('error', (error) => {
    console.error('❌ Bull queue error:', error);
});

console.log('🚀 Bull queue initialized for story deletion');

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    await storyQueue.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    await storyQueue.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
