import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const RecentMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const currentUser = useSelector((state) => state.user.value);

    // Update time every minute for real-time feel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, []);

    const getId = (objOrId) => {
        if (!objOrId) return '';
        if (typeof objOrId === 'string') return objOrId;
        return objOrId._id || '';
    };

    const formatMessageTime = (messageTime) => {
        const messageDate = new Date(messageTime);
        const now = currentTime;
        
        // If message is from today
        if (moment(messageDate).isSame(now, 'day')) {
            return moment(messageDate).format('HH:mm'); // Show only time (e.g., 14:30)
        }
        // If message is from yesterday
        else if (moment(messageDate).isSame(moment(now).subtract(1, 'day'), 'day')) {
            return 'Yesterday';
        }
        // If message is from this week
        else if (moment(messageDate).isSame(now, 'week')) {
            return moment(messageDate).format('ddd'); // Show day (e.g., Mon)
        }
        // If message is older
        else {
            return moment(messageDate).format('DD/MM'); // Show date (e.g., 15/08)
        }
    };

    const fetchRecentMessages = async () => {
        try {
            setLoading(true);
            const { data } = await api.post('/api/user/recent-messages');
            if (data.success) {
                const allMessages = data.messages || [];

                const currentUserId = getId(currentUser);

                // Map: otherUserId -> latest message
                const convoMap = new Map();

                for (const msg of allMessages) {
                    const fromId = getId(msg.from_user_id);
                    const toId = getId(msg.to_user_id);

                    const isSentByMe = fromId === currentUserId;

                    // Determine the other participant consistently
                    const otherUserObj = isSentByMe ? (msg.to_user_id || {}) : (msg.from_user_id || {});
                    const otherUserId = getId(otherUserObj);

                    // Skip self-conversations if any exist
                    if (!otherUserId || otherUserId === currentUserId) continue;

                    const enriched = {
                        ...msg,
                        isSentByMe,
                        otherUser: otherUserObj,
                    };

                    const existing = convoMap.get(otherUserId);
                    if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
                        convoMap.set(otherUserId, enriched);
                    }
                }

                const sorted = Array.from(convoMap.values()).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setConversations(sorted);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching recent messages:', error);
            toast.error(error.message);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser?._id) {
            fetchRecentMessages();
            const interval = setInterval(fetchRecentMessages, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser?._id]);

    if (loading) {
        return (
            <div className='bg-white max-w-xs p-4 rounded-md shadow text-xs text-slate-800'>
                <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
                <div className='max-h-48 flex items-center justify-center'>
                    <p className='text-gray-500'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white max-w-xs p-4 rounded-md shadow text-xs text-slate-800'>
            <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-48 overflow-y-auto scrollbar-hide pb-2'>
                {conversations.length > 0 ? (
                    conversations.slice(0, 10).map((conversation, index) => {
                        const otherUser = conversation.otherUser;
                        const otherUserId = getId(otherUser);
                        const otherUserName = otherUser?.full_name || 'Unknown User';
                        const otherUserPic = otherUser?.profile_picture;

                        const sentClasses = 'bg-indigo-50 text-indigo-700';
                        const receivedClasses = 'bg-purple-50 text-purple-700';

                        return (
                            <Link 
                                to={`/messages/${otherUserId}`} 
                                key={index} 
                                className='flex items-start gap-2 py-2 hover:bg-slate-100 rounded px-1 transition-colors'
                            >
                                {otherUserPic ? (
                                    <img 
                                        src={otherUserPic} 
                                        alt='' 
                                        className='w-8 h-8 rounded-full object-cover flex-shrink-0' 
                                    />
                                ) : (
                                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0'>
                                        {otherUserName.charAt(0)}
                                    </div>
                                )}
                                <div className='w-full min-w-0'>
                                    <div className='flex justify-between items-center'>
                                        <p className='font-medium truncate'>
                                            {otherUserName}
                                        </p>
                                        <p className='text-[10px] text-slate-400 flex-shrink-0 ml-1'>
                                            {formatMessageTime(conversation.createdAt)}
                                        </p>
                                    </div>
                                    <div className='flex justify-between items-center mt-1'>
                                        <div className={`flex items-center gap-1 flex-1 min-w-0 px-2 py-1 rounded ${conversation.isSentByMe ? sentClasses : receivedClasses}`}>
                                            {conversation.isSentByMe && (
                                                <span className='text-[10px] font-medium'>You:</span>
                                            )}
                                            <p className='truncate'>
                                                {conversation.text ? conversation.text : 'Media message'}
                                            </p>
                                        </div>
                                        {!conversation.seen && !conversation.isSentByMe && (
                                            <div className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0 ml-1'>
                                                1
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <p className='text-gray-500 text-center py-4'>No recent messages</p>
                )}
                {conversations.length > 10 && (
                    <div className='text-center py-2 text-indigo-600 text-xs font-medium'>
                        +{conversations.length - 10} more conversations
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecentMessages;


