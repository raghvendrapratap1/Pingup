import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { dummyStoriesData } from '../assets/assets';
import { Plus, Trash2, MoreVertical } from 'lucide-react';
import moment from 'moment/moment';
import StoryModel from './StoryModel';
import StoryViewer from './StoryViewer';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const StoriesBar = () => {
    const [stories,setStories]=useState([]);
    const [showModal,setShowModal]=useState(false);
    const [viewStory,setViewStory]=useState(null);
    const [showOptions, setShowOptions] = useState(null);
    const user = useSelector((state)=>state.user.value);

    const fetchStories=async()=>{
        try{
            const {data} = await api.get('/api/story/get', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            })
            if(data.success){
                setStories(data.stories);
            }else{
                toast(data.message);
            }

        }catch(error){
            toast.error(error.message);
        }
    }

    const handleDeleteStory = async (storyId) => {
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
                const { data } = await api.delete(`/api/story/delete/${storyId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
                });

                if (data.success) {
                    toast.success('Story deleted successfully!');
                    fetchStories(); // Refresh stories
                    setShowOptions(null);
                } else {
                    toast.error(data.message || 'Failed to delete story');
                }
            }
        } catch (error) {
            console.error('Delete story error:', error);
            toast.error('Failed to delete story');
        }
    };

    const isOwnStory = (story) => {
        return user?._id === story.user?._id;
    };

    useEffect(()=>{
        if(user){
            fetchStories()
        }
    },[user])

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showOptions && !event.target.closest('.story-options')) {
                setShowOptions(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

  return (

        <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl overflow-x-auto scrollbar-hide px-4'>

        <div className='flex gap-4 pb-5'>
            {/* add story card */}
            <div onClick={()=>setShowModal(true)} className='rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white flex-shrink-0' >
                <div className='h-full flex flex-col items-center justify-center p-4'>
                    <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                        <Plus className='w-5 h-5 text-white'/>
                    </div>
                    <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
                </div>
                {/* story cards */}
                </div>

                {
                    stories.map((story,index)=>(
                        <div key={index} className={`relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 flex-shrink-0`}>
                            {story.user.profile_picture && (
                                <img src={story.user.profile_picture} alt="" className='absolute size-8 top-3 z-10 rounded-full ring ring-gray-100 shadow'/>
                            )}
                            <p className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>{story.content}</p>
                            <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
                            
                            {/* Delete button for own stories */}
                            {isOwnStory(story) && (
                                <div className="story-options relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptions(showOptions === story._id ? null : story._id);
                                        }}
                                        className="absolute top-2 right-2 z-20 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-white" />
                                    </button>
                                    
                                    {showOptions === story._id && (
                                        <div className="absolute top-8 right-0 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteStory(story._id);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Story
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Story content */}
                            <div onClick={()=>setViewStory(story)} className="w-full h-full">
                                {
                                    story.media_type!== 'text' && (
                                        <div className='absolute inset-0 z-1 rounded-lg bg-black overflow-hidden'>
                                            {
                                    story.media_type === "image" ? <img src={story.media_url} alt="" className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'/>
                                    : 
                                    <video src={story.media_url} className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'/>
                                }
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                    ))
                }
        </div>
        {/* add story modal */}
        {showModal && <StoryModel setShowModal={setShowModal} fetchStories={fetchStories}/>}
        {/* view story modal */}

        {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} onDelete={handleDeleteStory}/>}
</div>


  )
}

export default StoriesBar;

