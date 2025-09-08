import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const ChatHeader = ({
  user,
  isOnline,
  lastSeen,
  onBack,
  onClearChat,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every minute (not every second → better performance)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeenTime) => {
    if (!lastSeenTime) return "";

    const lastSeenDate = new Date(lastSeenTime);
    const now = currentTime;

    if (moment(lastSeenDate).isSame(now, "day")) {
      return `Last seen today at ${moment(lastSeenDate).format("HH:mm")}`;
    } else if (moment(lastSeenDate).isSame(moment(now).subtract(1, "day"), "day")) {
      return `Last seen yesterday at ${moment(lastSeenDate).format("HH:mm")}`;
    } else if (moment(lastSeenDate).isSame(now, "week")) {
      return `Last seen ${moment(lastSeenDate).format("ddd")} at ${moment(
        lastSeenDate
      ).format("HH:mm")}`;
    } else {
      return `Last seen ${moment(lastSeenDate).format("DD/MM/YYYY HH:mm")}`;
    }
  };

  const getStatusColor = () => (isOnline ? "bg-green-500" : "bg-gray-400");

  const getStatusText = () =>
    isOnline ? (
      <span className="text-green-600 font-medium">● online</span>
    ) : (
      formatLastSeen(lastSeen)
    );

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          onClick={onBack || (() => navigate("/messages"))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* User avatar & info */}
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => user?._id && navigate(`/profile/${user._id}`)}
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user?.full_name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.full_name ? user.full_name.charAt(0) : "U"}
              </div>
            )}
            {/* Status dot */}
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`}
            ></div>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800">
              {user?.full_name || "User"}
            </h3>
            <p className="text-xs text-gray-500">{getStatusText()}</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClearChat}
          className="p-2 hover:bg-red-50 rounded-full transition-colors group"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
