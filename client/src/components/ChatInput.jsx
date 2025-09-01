import React, { useState, useRef } from 'react';
import { ImageIcon, SendHorizonal, Smile, X } from 'lucide-react';

const ChatInput = ({ 
    text, 
    setText, 
    image, 
    setImage, 
    onSend, 
    replyTo, 
    onCancelReply,
    onTyping,
    isTyping 
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const imageInputRef = useRef(null);

    const handleTextChange = (e) => {
        setText(e.target.value);
        onTyping && onTyping(e.target.value);
    };

    const handleSend = () => {
        if (text.trim() || image) {
            onSend();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
        }
    };



    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😎', '🤔', '😢', '😡', '🥳', '😴'];

    return (
        <div className="bg-white border-t border-gray-200 p-3">
            {/* Reply preview */}
            {replyTo && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium">Replying to</div>
                            <div className="text-sm text-gray-700 truncate">
                                {replyTo.text || 'Media message'}
                            </div>
                        </div>
                        <button 
                            onClick={onCancelReply}
                            className="p-1 hover:bg-gray-200 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main input area */}
            <div className="flex items-center gap-2">
                {/* Image button */}
                <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        onKeyPress={handleKeyPress}
                        placeholder={replyTo ? "Type a reply..." : "Type a message..."}
                        className="w-full resize-none border border-gray-300 rounded-full px-4 py-2 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        rows="1"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    
                    {/* Emoji button */}
                    <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                </div>

                {/* Send button */}
                <button 
                    onClick={handleSend}
                    className="flex-shrink-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 active:scale-95 transition-all"
                >
                    <SendHorizonal className="w-5 h-5" />
                </button>
            </div>

            {/* Emoji picker */}
            {showEmojiPicker && (
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="grid grid-cols-6 gap-2">
                        {emojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setText(prev => prev + emoji);
                                    setShowEmojiPicker(false);
                                }}
                                className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Image preview */}
            {image && (
                <div className="mt-2 relative inline-block">
                    <img 
                        src={URL.createObjectURL(image)} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button 
                        onClick={() => setImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Hidden image input */}
            <input 
                ref={imageInputRef}
                type="file" 
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />
        </div>
    );
};

export default ChatInput;
