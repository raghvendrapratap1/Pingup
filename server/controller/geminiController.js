import { generateChatResponse } from '../config/aiConfig.js';

// POST endpoint - Chat conversation with AI
export const chatWithAI = async (req, res) => {
    try {
        console.log('🔍 Chat request received:', {
            body: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString()
        });

        const { messages, maxTokens = 500, temperature = 0.7 } = req.body;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('❌ Validation failed: Messages array is empty or invalid');
            return res.status(400).json({
                success: false,
                message: 'Messages array is required with at least one message'
            });
        }

        // Validate each message
        for (const message of messages) {
            if (!message.role || !message.content) {
                console.log('❌ Validation failed: Message missing role or content:', message);
                return res.status(400).json({
                    success: false,
                    message: 'Each message must have role and content'
                });
            }
            
            if (!['user', 'assistant'].includes(message.role)) {
                console.log('❌ Validation failed: Invalid message role:', message.role);
                return res.status(400).json({
                    success: false,
                    message: 'Message role must be either "user" or "assistant"'
                });
            }
        }

        console.log('✅ Validation passed, generating AI response...');
        console.log('📚 Conversation context:', {
            messageCount: messages.length,
            lastMessage: messages[messages.length - 1].content,
            conversationFlow: messages.map(m => `${m.role}: ${m.content.substring(0, 30)}...`)
        });
        
        // Generate chat response
        const response = await generateChatResponse(messages);
        
        console.log('✅ AI response generated successfully');

        res.json({
            success: true,
            message: 'Chat response generated successfully',
            data: {
                messages: [...messages, { role: 'assistant', content: response }],
                response,
                maxTokens: parseInt(maxTokens),
                temperature: parseFloat(temperature),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Chat with AI Error:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Failed to generate chat response. Please try again.',
            error: error.message
        });
    }
};
