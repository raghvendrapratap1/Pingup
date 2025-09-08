import React, { useState, useRef, useEffect, useCallback } from "react";
import { SendHorizonal, Smile, X, Image, FileVideo } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import debounce from "lodash.debounce";

const ChatInput = ({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  isUploading,
  uploadProgress,
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Debounced typing event
  const debouncedTyping = useCallback(
    debounce((value) => {
      onTyping && onTyping(value);
    }, 500),
    []
  );

  const handleTextChange = (e) => {
    setText(e.target.value);
    debouncedTyping(e.target.value);
  };

  // ✅ Media preview cleanup
  useEffect(() => {
    let objectUrl;
    if (image) {
      objectUrl = URL.createObjectURL(image);
      setPreviewImage(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  useEffect(() => {
    let objectUrl;
    if (video) {
      objectUrl = URL.createObjectURL(video);
      setPreviewVideo(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video]);

  const handleSend = () => {
    if (!text.trim() && !image && !video) return;

    onSend({
      text: text.trim(),
      image,
      video,
      replyTo,
    });

    setText("");
    setImage(null);
    setVideo(null);
    setPreviewImage(null);
    setPreviewVideo(null);
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ✅ Use onKeyDown instead of onKeyPress
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji.native);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      setImage(file);
      setVideo(null);
    } else if (file.type.startsWith("video/")) {
      setVideo(file);
      setImage(null);
    }
  };

  return (
    <div className="p-2 border-t border-gray-200 bg-white relative">
      {/* Reply Preview */}
      {replyTo && (
        <div className="p-2 bg-gray-100 border border-gray-300 rounded-lg mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-700 truncate max-w-[80%]">
            Replying to: {replyTo.text}
          </span>
          <button onClick={onCancelReply} className="text-gray-500 hover:text-gray-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {previewImage && (
        <div className="relative mb-2">
          <img
            src={previewImage}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={() => {
              setImage(null);
              setPreviewImage(null);
            }}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Video Preview */}
      {previewVideo && (
        <div className="relative mb-2">
          <video
            src={previewVideo}
            className="w-48 rounded-lg border border-gray-300"
            controls
          />
          <button
            onClick={() => {
              setVideo(null);
              setPreviewVideo(null);
            }}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Smile size={20} />
        </button>

        {/* Image Upload */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-500 hover:text-gray-700"
        >
          <Image size={20} />
        </button>

        {/* Video Upload */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-500 hover:text-gray-700"
        >
          <FileVideo size={20} />
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*"
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm outline-none max-h-32 overflow-y-auto"
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isUploading}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          {isUploading ? (
            <span className="text-xs">{uploadProgress}%</span>
          ) : (
            <SendHorizonal size={20} />
          )}
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-14 left-2 z-50">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default ChatInput;
