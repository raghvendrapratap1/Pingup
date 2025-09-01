import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [feeds, setFeeds] = useState([]); // always array
  const [loading, setLoading] = useState(true);
  const [playingVideos, setPlayingVideos] = useState({}); // Global video state
  const user = useSelector((state)=>state.user.value);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/post/feed');

      if (data.success) {
        setFeeds(Array.isArray(data.posts) ? data.posts : []); // ✅ must use 'posts'
      } else {
        setFeeds([]);
        toast.error(data.message || 'Failed to fetch feeds');
      }
    } catch (error) {
      console.error(error);
      setFeeds([]);
      toast.error(error.message || 'Something went wrong');
    }
    setLoading(false);
  };

  // Global function to handle video toggling - ensures only one video plays at a time
  const toggleVideo = (videoId) => {
    setPlayingVideos(prev => {
      const newState = !prev[videoId];
      
      if (newState) {
        // If starting a new video, pause all others first
        // Pause all currently playing videos
        Object.keys(prev).forEach(key => {
          if (prev[key]) {
            const videoElement = document.querySelector(`video[src*="${key.split('/').pop()}"]`);
            if (videoElement) {
              videoElement.pause();
            }
          }
        });
        
        // Update state to pause all other videos
        const updatedState = {};
        Object.keys(prev).forEach(key => {
          updatedState[key] = false;
        });
        updatedState[videoId] = true;
        return updatedState;
      } else {
        // Just pause the current video
        return {
          ...prev,
          [videoId]: false
        };
      }
    });
  };

  useEffect(() => {
    if(user){
      fetchFeeds();
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories and post list */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.length > 0 ? (
            feeds.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                fetchFeeds={fetchFeeds}
                playingVideos={playingVideos}
                toggleVideo={toggleVideo}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No posts found</p>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="max-xl:hidden sticky top-0">
        {user && <RecentMessages />}
      </div>
    </div>
  );
};

export default Feed;
