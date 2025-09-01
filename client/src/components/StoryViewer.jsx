import { BadgeCheck, Heart, X, Trash2, MoreVertical } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const StoryViewer = ({viewStory, setViewStory, onDelete}) => {
    const [progress,setProgress] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const user = useSelector((state)=>state.user.value);
    const [isLiked,setIsLiked] = useState(false);
    const [likeCount,setLikeCount] = useState(0);

    const isOwnStory = user?._id === viewStory?.user?._id;

    // initialize like state from incoming story
    useEffect(()=>{
        if(viewStory){
            const likes = Array.isArray(viewStory.likes_count) ? viewStory.likes_count : [];
            setIsLiked(Boolean(user && likes.map(String).includes(String(user?._id))));
            setLikeCount(likes.length);
        }
    },[viewStory,user])

    useEffect(()=>{
        let timer,progressInterval;
        if(viewStory){
             setProgress(0);
             const duration = viewStory.media_type === 'video' ? 15000 : 10000; // 15 seconds for video, 10 for others
             const setTime = 100;
             let elapsed = 0;

            progressInterval=  setInterval(()=>{
                elapsed+= setTime;
                setProgress((elapsed / duration ) * 100)
             },setTime);
             //close story after duration
             timer = setTimeout(()=>{
                setViewStory(null);
             },duration)
        }

        return()=>{
            clearTimeout(timer);
            clearInterval(progressInterval);
        }
    }, [viewStory,setViewStory])

    const handleClose =()=>{
        setViewStory(null);
    }

    const handleDeleteStory = async () => {
        try {
            const result = await Swal.fire({
                title: 'Delete Story?',
                text: "This action cannot be undone!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const { data } = await api.delete(`/api/story/delete/${viewStory._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
                });

                if (data.success) {
                    toast.success('Story deleted successfully!');
                    setViewStory(null);
                    // Call parent's onDelete if provided
                    if (onDelete) {
                        onDelete(viewStory._id);
                    }
                } else {
                    toast.error(data.message || 'Failed to delete story');
                }
            }
        } catch (error) {
            console.error('Delete story error:', error);
            toast.error('Failed to delete story');
        }
    };

    const handleLike = async ()=>{
        if(!viewStory?._id) return;
        const next = !isLiked;
        setIsLiked(next);
        setLikeCount((c)=> next ? c+1 : Math.max(0, c-1));
        try{
            await api.post('/api/story/like',{storyId: viewStory._id},{
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            })
        }catch(err){
            // revert on error
            setIsLiked(!next);
            setLikeCount((c)=> !next ? c+1 : Math.max(0, c-1));
        }
    }

    const renderContent =() =>{

        switch (viewStory.media_type) {
            case 'image':
                return (
                    <img src={viewStory.media_url} alt="" className='max-w-full max-h-screen object-contain' />
                )
        
            case 'video':
                return (
                    <video 
                        src={viewStory.media_url} 
                        onEnded={()=>setViewStory(null)} 
                        className='max-h-screen' 
                        autoPlay 
                        muted
                        loop={false}
                    />
                )
         
            case 'text':
                return (
                    <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center'>
                        {viewStory.content}
                    </div>
                )
           
            default:
                return null;
              
        }
    }

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showOptions && !event.target.closest('.story-options')) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

  return (
    <div className='fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center' style={({backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color: '#000000'})}>

        {/* progress bar */}
        <div className='absolute top-0 left-0 w-full h-1 bg-gray-700'>
            <div className='h-full bg-white transition-all duration-100 linear' style={{width: `${progress}%`}}></div>
        </div>

        {/* User info - top left */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur rounded bg-black/50">
            <img
                src={viewStory.user?.profile_picture}
                alt=""
                className="ize-7 sm:size-8 rounded-full object-cover border border-white"
            />
            <div className='text-white font-medium flex items-center gap-1.5'>
            <span className="text-white font-semibold text-lg">{viewStory.user?.full_name}</span>
            <BadgeCheck size={18} />
            </div>
        </div>

        {/* Top right buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Delete button for own stories */}
            {isOwnStory && (
                <div className="story-options relative">
                    <button 
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                    
                    {showOptions && (
                        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32">
                            <button 
                                onClick={handleDeleteStory}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Story
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* close button */}
            <button onClick={handleClose} className='text-white text-3xl fond-bold focus:outline-none'>
                <X className='w-8 h-8 hover:scale-110 transition cursor-pointer'/>
            </button>
        </div>

        {/* Content wrappper */}

        <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center'>
            {renderContent()}
        </div>

        {/* Like button */}
        <button onClick={handleLike} className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition'>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}/>
            <span>{likeCount}</span>
        </button>
    </div>
  )
}

export default StoryViewer