// AI Configuration - Supports multiple AI services
let openai = null;
let geminiAI = null;
let isOpenAIAvailable = false;
let isGeminiAvailable = false;

// Initialize OpenAI
const initializeOpenAI = async () => {
    try {
        const OpenAI = await import('openai');
        if (process.env.OPENAI_API_KEY) {
            openai = new OpenAI.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
            isOpenAIAvailable = true;
            console.log('✅ OpenAI initialized successfully');
        } else {
            console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
            isOpenAIAvailable = false;
        }
    } catch (error) {
        console.warn('⚠️ OpenAI package not installed. Running with enhanced mock AI.');
        isOpenAIAvailable = false;
    }
};

// Initialize Gemini AI
const initializeGemini = async () => {
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        if (process.env.GEMINI_API_KEY) {
            geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            isGeminiAvailable = true;
            console.log('✅ Gemini AI initialized successfully');
        } else {
            console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
            isGeminiAvailable = false;
        }
    } catch (error) {
        console.warn('⚠️ Gemini AI package not installed.');
        isGeminiAvailable = false;
    }
};

// Initialize all AI services
const initializeAI = async () => {
    console.log('🚀 Initializing AI services...');
    await initializeOpenAI();
    await initializeGemini();
    console.log('✅ AI services initialization complete');
    console.log(`📊 Status: OpenAI=${isOpenAIAvailable}, Gemini=${isGeminiAvailable}`);
};

// Enhanced Mock AI with better responses
const generateEnhancedMockResponse = async (prompt) => {
    const promptLower = prompt.toLowerCase();
    
    // Emotional responses with better understanding
    if (promptLower.includes('i am sad') || promptLower.includes('i\'m sad') || promptLower.includes('i feel sad')) {
        const sadResponses = [
            "I'm so sorry you're feeling sad right now. 😔 It's completely okay to feel this way, and I'm here to listen. Sometimes talking about what's bothering us can help. Would you like to share what's on your mind? You don't have to go through this alone.",
            "I hear you, and I want you to know that your feelings are valid. 💙 It's okay to feel sad sometimes. I'm here to listen and support you. What's been going on that's making you feel this way?",
            "I can sense that you're going through a tough time, and I want you to know that you're not alone. 🌸 I'm here to listen and help however I can. What's been weighing on your mind lately?"
        ];
        return sadResponses[Math.floor(Math.random() * sadResponses.length)];
    }
    
    if (promptLower.includes('i am happy') || promptLower.includes('i\'m happy') || promptLower.includes('i feel happy')) {
        return "That's wonderful! 😊 I'm so glad you're feeling happy! Joy is such a beautiful emotion to experience. What's been bringing you happiness lately? I'd love to hear about it and celebrate with you!";
    }
    
    if (promptLower.includes('i am tired') || promptLower.includes('i\'m tired') || promptLower.includes('i feel tired')) {
        return "I can see that you're feeling tired, and that's completely understandable. 😴 Life can be exhausting sometimes. What's been draining your energy lately? I'm here to listen and help you find ways to recharge and take care of yourself.";
    }
    
    if (promptLower.includes('i am worried') || promptLower.includes('i\'m worried') || promptLower.includes('i feel worried')) {
        return "I can sense that you're feeling anxious, and I want you to know that it's okay to feel this way. 😰 Anxiety can be really challenging. What's been making you feel worried? I'm here to help you work through it and find some peace of mind.";
    }
    
    // Greetings
    if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey')) {
        const greetings = [
            "Hey there! 👋 How's your day going? I'm here to chat and help with whatever you need!",
            "Hello! 😊 Great to see you! What's on your mind today?",
            "Hi there! 🌟 How can I make your day a little better?",
            "Hey! ✨ What would you like to talk about or work on together?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (promptLower.includes('how are you')) {
        return "I'm doing great, thanks for asking! 😊 I'm always excited to help and chat with people like you. How about you - how's your day been?";
    }
    
    // Help requests
    if (promptLower.includes('help') || promptLower.includes('assist')) {
        return "Of course! I'd love to help you out! 😊 I can chat about anything, help with writing, explain things, solve problems, or just be a friendly ear. What's on your mind?";
    }
    
    // Writing and creativity
    if (promptLower.includes('write') || promptLower.includes('create') || promptLower.includes('generate')) {
        return "Absolutely! I love helping with creative projects! ✍️ Whether it's stories, articles, poems, or any kind of writing, I'm here to brainstorm and help bring your ideas to life. What kind of writing project are you thinking about?";
    }
    
    // Explanations
    if (promptLower.includes('explain') || promptLower.includes('what is') || promptLower.includes('how to')) {
        return "I'd be happy to explain that! 📚 I love breaking down complex topics into simple, easy-to-understand pieces. What would you like me to explain? I'll make sure it's crystal clear!";
    }
    
    // Math
    if (promptLower.includes('math') || promptLower.includes('calculate') || promptLower.includes('equation')) {
        return "Math is actually pretty cool when you break it down! 🔢 I can help explain concepts, walk through problems step by step, and make it all make sense. What math question is giving you trouble?";
    }
    
    // Programming
    if (promptLower.includes('programming') || promptLower.includes('code') || promptLower.includes('software')) {
        return "Programming is awesome! 💻 I can help explain concepts, debug code, suggest solutions, and make coding less intimidating. What programming challenge are you working on?";
    }
    
    // Business
    if (promptLower.includes('business') || promptLower.includes('marketing') || promptLower.includes('strategy')) {
        return "Business strategy is fascinating! 💼 I can help brainstorm ideas, analyze approaches, and think through challenges. What business question or project are you working on?";
    }
    
    // Personal statements
    if (promptLower.includes('i am') || promptLower.includes('i\'m') || promptLower.includes('i feel')) {
        return "I hear you, and I want you to know that I'm here to listen and support you. 💙 Whatever you're going through, it's valid and important. Would you like to tell me more about what's on your mind? I'm here to help however I can.";
    }
    
    if (promptLower.includes('i want') || promptLower.includes('i need') || promptLower.includes('i would like')) {
        return "I understand, and I want to help you with that! 😊 Let me know more about what you're looking for, and I'll do my best to assist you. What specifically would you like help with?";
    }
    
    // Default intelligent response
    const intelligentResponses = [
        `I hear you, and I want to help! 🤔 Let me understand better - what specifically about "${prompt}" would you like to explore or work on?`,
        `That's something I'd love to help you with! 💡 Tell me more about "${prompt}" and how I can best support you.`,
        `I'm here to listen and help! 😊 What's on your mind regarding "${prompt}"? I want to make sure I understand what you need.`,
        `I'd be happy to help you with that! 🌟 Let me know more about "${prompt}" so I can provide the best assistance possible.`
    ];
    
    return intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
};

// Generate response using available AI services
export const generateResponse = async (prompt) => {
    try {
        // Try OpenAI first
        if (isOpenAIAvailable && openai) {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly, empathetic AI assistant. Respond in a warm, conversational tone with emojis. Be supportive and understanding, especially when users share feelings or emotions."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });
            return completion.choices[0].message.content;
        }
        
        // Try Gemini AI
        if (isGeminiAvailable && geminiAI) {
            const model = geminiAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent([prompt]);
            const response = await result.response;
            return response.text();
        }
        
        // Fallback to enhanced mock AI
        return await generateEnhancedMockResponse(prompt);
        
    } catch (error) {
        console.error('AI Error:', error);
        return await generateEnhancedMockResponse(prompt);
    }
};

// Generate chat response with conversation history
export const generateChatResponse = async (messages) => {
    try {
        console.log('🤖 Starting AI response generation...');
        const lastMessage = messages[messages.length - 1].content;
        console.log('📝 Last message:', lastMessage);
        console.log('📚 Full conversation context:', messages.length, 'messages');
        
        // Try OpenAI first
        if (isOpenAIAvailable && openai) {
            console.log('🔍 Trying OpenAI...');
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly, empathetic AI assistant. Respond in a warm, conversational tone with emojis. Be supportive and understanding, especially when users share feelings or emotions. IMPORTANT: Always respond to the user's current message in context of the conversation. Don't give generic greetings if the user is already in a conversation."
                    },
                    ...messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                max_tokens: 500,
                temperature: 0.7,
            });
            console.log('✅ OpenAI response generated');
            return completion.choices[0].message.content;
        }
        
        // Try Gemini AI
        if (isGeminiAvailable && geminiAI) {
            console.log('🔍 Trying Gemini AI...');
            const model = geminiAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                history: messages.slice(0, -1).map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                })),
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });
            const result = await chat.sendMessage([lastMessage]);
            const response = await result.response;
            console.log('✅ Gemini AI response generated');
            return response.text();
        }
        
        // Fallback to enhanced mock AI with conversation context
        console.log('🔄 Falling back to enhanced mock AI...');
        return await generateEnhancedMockResponseWithContext(messages);
        
    } catch (error) {
        console.error('❌ Chat AI Error:', error);
        console.error('❌ Error stack:', error.stack);
        console.log('🔄 Falling back to enhanced mock AI due to error...');
        return await generateEnhancedMockResponseWithContext(messages);
    }
};

// Enhanced Mock AI with conversation context awareness
const generateEnhancedMockResponseWithContext = async (messages) => {
    const lastMessage = messages[messages.length - 1].content;
    const promptLower = lastMessage.toLowerCase();
    
    // Check conversation context
    const isInConversation = messages.length > 2; // More than initial greeting + user message
    const previousMessages = messages.slice(-3); // Last 3 messages for context
    
    console.log('🎭 Mock AI analyzing context:', {
        messageCount: messages.length,
        isInConversation,
        lastMessage: lastMessage.substring(0, 50) + '...'
    });
    
    // If we're in an active conversation, respond contextually
    if (isInConversation) {
        // Check for specific conversation patterns
        if (promptLower.includes('ready') || promptLower.includes('explore')) {
            return "Absolutely! I'm ready to explore anything with you! 🚀 What topic interests you? We could talk about technology, science, movies, books, travel, or anything else that catches your fancy. What would you like to dive into?";
        }
        
        if (promptLower.includes('nothing') || promptLower.includes('empty')) {
            return "That's totally okay! 😊 Sometimes our minds need a break. How about I suggest something fun? We could play a word game, talk about your favorite movies, or I could tell you an interesting fact. What sounds good to you?";
        }
        
        if (promptLower.includes('worst') || promptLower.includes('bad') || promptLower.includes('terrible')) {
            return "I'm so sorry you're feeling that way! 😔 I want to help make this better. Can you tell me more about what's bothering you? I'm here to listen and support you through whatever you're going through.";
        }
        
        if (promptLower.includes('fun') || promptLower.includes('enjoy')) {
            return "That's the spirit! 🎉 Let's have some fun together! We could play 20 questions, tell jokes, share interesting facts, or just chat about whatever makes you happy. What kind of fun would you like to have?";
        }
        
        // Generic contextual response for ongoing conversations
        const contextualResponses = [
            `I hear you! 😊 Let's keep this conversation going. What's on your mind about "${lastMessage}"?`,
            `That's interesting! 🤔 Tell me more about what you're thinking. I'm really curious to hear your thoughts.`,
            `I love where this conversation is going! 💫 What else would you like to explore or discuss?`,
            `You know what? That's a great point! 🌟 Let's dive deeper into that. What specifically interests you about it?`
        ];
        return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
    }
    
    // For new conversations, use the original greeting logic
    return await generateEnhancedMockResponse(lastMessage);
};

// Initialize AI when module loads
initializeAI();

export default {
    generateResponse,
    generateChatResponse,
    generateEnhancedMockResponse
};
