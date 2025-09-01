import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your friendly AI assistant! I\'m here to chat, help you out, and make your day a little better. Whether you want to talk about anything, get help with a project, or just have a friendly conversation - I\'m all ears! What\'s on your mind? 😊',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🚀 Sending chat request to backend...');
      
      // Chat mode - send conversation history
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log('📤 Request payload:', {
        messages: conversationMessages,
        maxTokens: 500,
        temperature: 0.7
      });
      
      const response = await api.post('/api/gemini/chat', {
        messages: conversationMessages,
        maxTokens: 500,
        temperature: 0.7
      });

      console.log('✅ Backend response received:', response.data);

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        console.log('✅ AI message added to chat');
        setIsConnected(true); // Mark as connected on successful response
      } else {
        throw new Error(response.data.message || 'Failed to get AI response');
      }
        } catch (error) {
      console.error('❌ AI API Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show helpful error message
      toast.error('Oops! Let\'s try that again! 😊');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Oops! 😅 I\'m having a little trouble right now, but don\'t worry! Let\'s try that again - sometimes I just need a moment to think. What would you like to chat about?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false); // Mark as disconnected on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Hey there! 👋 I\'m your friendly AI assistant! I\'m here to chat, help you out, and make your day a little better. Whether you want to talk about anything, get help with a project, or just have a friendly conversation - I\'m all ears! What\'s on your mind? 😊',
        timestamp: new Date().toISOString()
      }
    ]);
  };



  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
             

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
               <Bot className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
               <p className="text-gray-600">Your friendly companion for chats, help, and fun conversations! 😊</p>
             </div>
           </div>
           <button
             onClick={clearChat}
             className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
           >
             <RefreshCw className="w-4 h-4" />
             Clear Chat
           </button>
         </div>
       </div>



             <div className="flex-1 flex">
         {/* Main Chat Area */}
         <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                                         <div className="flex-1">
                       <div className="whitespace-pre-wrap">{message.content}</div>
                       <div className={`text-xs mt-2 ${
                         message.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                       }`}>
                                                   {new Date(message.timestamp).toLocaleTimeString()}
                       </div>
                     </div>
                    {message.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                                     placeholder="What's on your mind? Let's chat! 😊 (Press Enter to send, Shift+Enter for new line)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
