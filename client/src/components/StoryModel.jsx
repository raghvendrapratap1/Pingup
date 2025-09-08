import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const StoryModel = ({ setShowModal, fetchStories }) => {
  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState("#4f46e5");
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50; // MB

  // ✅ File Upload Handler
  const handleMediaUpload = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        toast.error("No file selected.");
        return;
      }

      // ✅ Check type
      if (file.type.startsWith("image")) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      } else if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          toast.error(`Video size cannot exceed ${MAX_VIDEO_SIZE_MB}MB.`);
          return;
        }

        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error("Video duration cannot exceed 1 minute.");
            setMedia(null);
            setPreviewUrl(null);
          } else {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
          }
        };

        video.src = URL.createObjectURL(file);
      } else {
        toast.error("Unsupported file type. Please upload image or video.");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Something went wrong while selecting file.");
    }
  };

  // Upload media to ImageKit using server-generated auth
  const uploadToImageKit = async (file) => {
    // 1) get auth params from server
    const authRes = await api.get("/api/imagekit/auth", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!authRes?.data?.token || !authRes?.data?.signature || !authRes?.data?.expire) {
      throw new Error("Failed to get upload auth");
    }

    // 2) post to ImageKit upload endpoint
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("token", authRes.data.token);
    formData.append("signature", authRes.data.signature);
    formData.append("expire", authRes.data.expire);

    const uploadEndpoint = `${import.meta.env.VITE_IMAGEKIT_UPLOAD_URL || "https://upload.imagekit.io/api/v1/files/upload"}`;
    const resp = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`ImageKit upload failed: ${txt}`);
    }
    const json = await resp.json();
    return json?.url;
  };

  // ✅ Create Story
  const handleCreateStory = async () => {
    try {
      let media_type = "text";
      if (mode === "media") {
        if (media?.type.startsWith("image")) media_type = "image";
        else if (media?.type.startsWith("video")) media_type = "video";
        else throw new Error("Invalid media type.");
      }

      if (media_type === "text" && !text.trim()) {
        throw new Error("Please write something for text story.");
      }

      setLoading(true);

      let media_url;
      // For images/videos, upload to ImageKit first to avoid large payloads to Vercel
      if (media_type === "image" || media_type === "video") {
        media_url = await toast.promise(uploadToImageKit(media), {
          loading: "Uploading media...",
          success: "Media uploaded",
          error: "Failed to upload media",
        });
      }

      const formData = new FormData();
      formData.append("content", text);
      formData.append("media_type", media_type);
      formData.append("background_color", background);
      if (media_url) formData.append("media_url", media_url);

      // ✅ Toast popup for Uploading...
      await toast.promise(
        api.post("/api/story/create", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        }),
        {
          loading: "Creating story...",
          success: "Story uploaded successfully ✅",
          error: "Failed to upload story ❌",
        }
      );

      setShowModal(false);
      fetchStories?.();
    } catch (err) {
      console.error("Create story error:", err);
      toast.error(err.message || "Error creating story.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button onClick={() => setShowModal(false)} className="text-white p-2 cursor-pointer">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* Story Preview */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}

          {mode === "media" && previewUrl && (
            media?.type.startsWith("image") ? (
              <img src={previewUrl} alt="preview" className="object-contain max-h-full" />
            ) : (
              <video src={previewUrl} controls className="object-contain max-h-full" />
            )
          )}
        </div>

        {/* 🎨 Color Picker */}
        <div className="flex mt-4 gap-2 items-center">
          <label className="text-sm">Pick Background:</label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-none"
          />
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input onChange={handleMediaUpload} type="file" accept="image/*,video/*" className="hidden" />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          onClick={handleCreateStory}
          className={`flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded 
            ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 transition cursor-pointer"
            }`}
        >
          <Sparkle size={18} /> {loading ? "Please wait..." : "Create Story"}
        </button>
      </div>
    </div>
  );
};

export default StoryModel;
