import React, { useState, useEffect } from 'react';
import moment from 'moment';

const MessageBubble = ({ message, isOwn, currentUser, onReply, onReact, onForward }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showOptions, setShowOptions] = useState(false);
    
    // Update time every minute for real-time feel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, []);

    const formatMessageTime = (messageTime) => {
        const messageDate = new Date(messageTime);
        const now = currentTime;
        
        // If message is from today
        if (moment(messageDate).isSame(now, 'day')) {
            return moment(messageDate).format('HH:mm'); // Show only time (e.g., 14:30)
        }
        // If message is from yesterday
        else if (moment(messageDate).isSame(moment(now).subtract(1, 'day'), 'day')) {
            return 'Yesterday ' + moment(messageDate).format('HH:mm');
        }
        // If message is from this week
        else if (moment(messageDate).isSame(now, 'week')) {
            return moment(messageDate).format('ddd HH:mm'); // Show day + time (e.g., Mon 14:30)
        }
        // If message is older
        else {
            return moment(messageDate).format('DD/MM/YYYY HH:mm'); // Show full date + time
        }
    };

    const getMessageStatus = () => {
        if (!isOwn) return null;
        
        if (message.delivered && message.seen) {
            return <span className="text-blue-500 text-xs">✓✓✓</span>; // Delivered and seen
        } else if (message.delivered) {
            return <span className="text-gray-400 text-xs">✓✓</span>; // Delivered
        } else {
            return <span className="text-gray-400 text-xs">✓</span>; // Sent
        }
    };

    const handleMessageOptions = () => {
        setShowOptions(!showOptions);
    };

    const handleReply = () => {
        onReply && onReply(message);
        setShowOptions(false);
    };





    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
            {/* Message Bubble */}
            <div className={`relative max-w-sm lg:max-w-md xl:max-w-lg ${
                isOwn ? 'order-2' : 'order-1'
            }`}>
                {/* Reply to message (if exists) */}
                {message.replyTo && (
                    <div className={`mb-1 p-2 rounded-lg text-xs opacity-70 ${
                        isOwn ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                        <div className="font-medium">Reply to:</div>
                        <div className="truncate">{message.replyTo.text || 'Media message'}</div>
                    </div>
                )}

                {/* Main Message Bubble */}
                <div className={`relative p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                    isOwn 
                        ? 'bg-purple-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                }`}>
                    {/* Message content */}
                    {message.message_type === 'image' && message.media_url ? (
                        <img 
                            src={message.media_url} 
                            alt="" 
                            className='w-full max-w-sm rounded-lg mb-2'
                        />
                    ) : null}
                    
                    {message.message_type === 'video' && message.media_url ? (
                        <video 
                            src={message.media_url} 
                            controls
                            className='w-full max-w-sm rounded-lg mb-2'
                        />
                    ) : null}
                    
                    <p className="mb-1 break-words">{message.text}</p>
                    
                    {/* Timestamp and Status */}
                    <div className={`flex items-center justify-end gap-1 text-xs ${
                        isOwn ? 'text-white opacity-80' : 'text-gray-500'
                    }`}>
                        {/* Real-time timestamp */}
                        <span className="font-medium">
                            {formatMessageTime(message.createdAt)}
                        </span>
                        
                        {/* Message status indicators (WhatsApp style) */}
                        {getMessageStatus()}
                    </div>
                </div>

                {/* Message Options Menu */}
                <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-32">
                        <button 
                            onClick={handleReply}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <span>↩️</span> Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* User Avatar (for received messages) */}
            {!isOwn && message.from_user_id?.profile_picture && (
                <div className="order-2 ml-2 self-end">
                    <img 
                        src={message.from_user_id.profile_picture} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                    />
                </div>
            )}


        </div>
    );
};

export default MessageBubble;
