# 🚀 Social Media Application

A full-stack social media application built with React, Node.js, and MongoDB featuring real-time messaging, AI integration, and modern social networking features.

## ✨ Features

- **User Authentication** - JWT-based auth with Google OAuth
- **Real-time Messaging** - Socket.IO powered chat system
- **AI Integration** - Gemini AI and OpenAI chat assistance
- **Media Sharing** - Image and video posts with ImageKit
- **Stories** - Instagram-style story feature
- **Connections** - LinkedIn-style networking system
- **Responsive Design** - Mobile-first UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Redux Toolkit
- Tailwind CSS
- Socket.IO Client
- Material-UI Components

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- ImageKit Integration
- Bull Queue System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- ImageKit Account
- Google OAuth Credentials
- AI API Keys (Gemini/OpenAI)

### Installation
```bash
# Clone repository
git clone <your-repo-url>
cd social-media-app

# Install all dependencies
npm run install:all

# Set up environment variables
cp server/env-template.txt server/.env
cp client/env-template.txt client/.env

# Update .env files with your credentials
```

### Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server:dev    # Backend on port 5000
npm run client:dev    # Frontend on port 5173
```

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm run start
```

## 🌐 Deployment

### Environment Variables
See `DEPLOYMENT_GUIDE.md` for complete setup instructions.

### Supported Platforms
- **Vercel** (Recommended)
- **Railway**
- **Render**
- **Heroku**

## 📱 API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile

### Posts
- `POST /api/post/add` - Create post
- `GET /api/post/feed` - Get feed posts
- `POST /api/post/like` - Like/unlike post

### Messages
- `POST /api/message/send` - Send message
- `POST /api/message/get` - Get chat messages

### Stories
- `POST /api/story/create` - Create story
- `GET /api/story/get` - Get stories

### AI Chat
- `POST /api/gemini/chat` - Chat with AI

## 🔧 Configuration

### Database
- MongoDB Atlas cluster
- Connection string in `MONGODB_URI`

### File Storage
- ImageKit for media files
- Supports images and videos

### Real-time
- Socket.IO for live features
- Bull queue for background jobs

## 📊 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── features/     # Redux slices
│   │   └── context/      # React context
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── controller/       # Route handlers
│   ├── models/          # Database models
│   └── middleware/      # Custom middleware
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For deployment help, see `DEPLOYMENT_GUIDE.md`
For development issues, check the documentation or create an issue.
