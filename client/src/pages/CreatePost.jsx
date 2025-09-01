import React, { useState } from 'react';
import { X, Image, Video, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user.value);

  const handleSubmit = async () => {
    if (!images.length && !videos.length && !content) {
      return toast.error('Please add at least one image, video or text');
    }

    setLoading(true); // start loading

    let postType = 'text';
    if (images.length && videos.length && content) {
      postType = 'text_with_image_and_video';
    } else if (images.length && videos.length) {
      postType = 'image_and_video';
    } else if (images.length && content) {
      postType = 'text_with_image';
    } else if (videos.length && content) {
      postType = 'text_with_video';
    } else if (images.length) {
      postType = 'image';
    } else if (videos.length) {
      postType = 'video';
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);
      
      // Add images
      images.forEach((image) => {
        formData.append('media', image);
      });
      
      // Add videos
      videos.forEach((video) => {
        formData.append('media', video);
      });

      // simple API call without Clerk
      const { data } = await api.post('/api/post/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // If your backend expects token from Redux or localStorage:
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (data.success) {
        toast.success('Post published successfully!');
        navigate('/'); // go to homepage
      } else {
        toast.error(data.message || 'Failed to publish post');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    }

    setLoading(false); // stop loading
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (imageFiles.length > 0) {
      setImages(prev => [...prev, ...imageFiles]);
    }
    
    if (videoFiles.length > 0) {
      setVideos(prev => [...prev, ...videoFiles]);
    }
    
    // Clear input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>

          {/* Header */}
          <div className='flex items-center gap-3'>
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="profile" 
                className='w-12 h-12 rounded-full shadow' 
              />
            ) : (
              <div className='w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow'>
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
            )}
            <div>
              <h2 className='font-semibold'>{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className='w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400'
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images Preview */}
          {images.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {images.map((image, i) => (
                <div key={`img-${i}`} className='relative group'>
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="uploaded" 
                    className='h-20 w-20 object-cover rounded-md' 
                  />
                  <div 
                    onClick={() => removeImage(i)}  
                    className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 left-0 bottom-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Videos Preview */}
          {videos.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {videos.map((video, i) => (
                <div key={`vid-${i}`} className='relative group'>
                  <div className='h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center relative overflow-hidden'>
                    <video 
                      src={URL.createObjectURL(video)} 
                      className='h-full w-full object-cover'
                      muted
                    />
                    <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                      <Play className='w-6 h-6 text-white' />
                    </div>
                  </div>
                  <div className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                    {formatFileSize(video.size).split(' ')[0]}
                  </div>
                  <div 
                    onClick={() => removeVideo(i)}  
                    className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 left-0 bottom-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>   
            <div className='flex items-center gap-3'>
              {/* Image Upload */}
              <label htmlFor="media" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
                <Image className='size-5' />
                <span className='hidden sm:inline'>Photos</span>
              </label>
              
              {/* Video Upload */}
              <label htmlFor="media" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
                <Video className='size-5' />
                <span className='hidden sm:inline'>Videos</span>
              </label>
            </div>

            <input 
              type="file" 
              id='media' 
              accept='image/*,video/*' 
              hidden 
              multiple 
              onChange={handleImageUpload}
            />

            <button 
              disabled={loading} 
              onClick={() => toast.promise(handleSubmit(),
                {
                  loading: 'Uploading...',
                  success: <p>Post Added Successfully!</p>,
                  error: <p>Failed to Add Post</p>
                }
              )} 
              className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-6 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>

          {/* File Info */}
          {(images.length > 0 || videos.length > 0) && (
            <div className='text-xs text-gray-500 pt-2 border-t border-gray-100'>
              <p>📸 {images.length} photo{images.length !== 1 ? 's' : ''} selected</p>
              <p>🎥 {videos.length} video{videos.length !== 1 ? 's' : ''} selected</p>
              <p className='text-xs text-gray-400 mt-1'>
                Supported: JPG, PNG, GIF, MP4, MOV, AVI (Max 50MB each)
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default CreatePost;

