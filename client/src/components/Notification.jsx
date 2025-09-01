import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Notification = ({t,message})=>{
    const navigate = useNavigate();

    return(
        <div className="max-w-sm sm:max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition-all duration-200 mx-2 sm:mx-0">
            <div className="flex-1 p-3 sm:p-4">
                <div className="flex items-start">
                    {message?.from_user_id?.profile_picture ? (
                        <img 
                            src={message.from_user_id.profile_picture} 
                            alt="" 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 mt-0.5 object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 mt-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                            {message?.from_user_id?.full_name?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {message?.from_user_id?.full_name || 'New message'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {(message?.text || '').slice(0, 30)}
                            {(message?.text || '').length > 30 ? '...' : ''}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button 
                    onClick={()=>{
                        navigate(`/messages/${message?.from_user_id?._id}`);
                        toast.dismiss(t.id);
                    }} 
                    className="p-2 sm:p-4 text-indigo-600 font-semibold text-xs sm:text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
                >
                    Reply
                </button>
            </div>
        </div>
    )
}

export default Notification;