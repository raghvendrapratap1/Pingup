import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import moment from 'moment';
import ProfileModal from '../components/ProfileModal';
import { useSelector } from 'react-redux';
import api from "../api/axios"
import toast from 'react-hot-toast'

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);

  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [likedPosts, setLikedPosts] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async (id) => {
    try {
      const { data } = await api.post("/api/user/profile", { profileId: id });

      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId);
    } else if (currentUser?._id) {
      fetchUser(currentUser._id);
    }
  }, [profileId, currentUser]);

  // Load liked posts whenever we switch to Likes
  useEffect(()=>{
    const loadLiked = async()=>{
      try{
        const id = profileId || currentUser?._id;
        if(!id) return;
        const { data } = await api.get('/api/post/liked', { params: { userId: id } });
        if(data.success){
          setLikedPosts(Array.isArray(data.posts) ? data.posts : []);
        }
      }catch(err){
        // ignore for now
      }
    }
    if(activeTab === 'likes'){
      loadLiked();
    }
  },[activeTab, profileId, currentUser])

  if (!user) return <Loading />;

  return  user ?(
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
        <div className='max-w-3xl mx-auto'>
            {/* Profile card */}

            <div className='bg-white rounded-2xl shadow overflow-hidden'>
                {/* Cover Photo */}
                <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
                    {
                        user.cover_photo ? <img src={user.cover_photo} alt="" className='w-full h-full object-cover'/> : 
                        <div className='h-full flex items-center justify-center'>
                            <div className='text-2xl sm:text-4xl font-bold text-gray-700'>{user.full_name || 'User'}</div>
                        </div>
                    }
                </div>
                {/* user info */}
                <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit}/>
            </div>
            {/* Tabs */}
            <div className='mt-6'>
                <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>{["posts","media","likes"].map((tab)=>(
                    <button onClick={()=>setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"} `}>
                        {tab.charAt(0).toUpperCase()+tab.slice(1)}
                    </button>
                ))}
                </div>

                {/* Posts */}
                {activeTab === 'posts' && (
                    <div className='mt-6 flex flex-col items-center gap-6'>
                        {
                            posts.map((post)=>(
                                <PostCard 
                                    key={post._id} 
                                    post={post} 
                                    onDeleted={()=>setPosts(prev=>prev.filter(p=>p._id!==post._id))}
                                    playingVideos={{}}
                                    toggleVideo={() => {}}
                                />
                            ))
                        }
                    </div>
                )}

                {/* Media */}
                {activeTab === 'media' && (
                    <div className='flex flex-wrap mt-6 max-w-6xl'>
                        {
                            posts.filter((post)=>post.image_urls.length > 0).map((post)=>
                            (    <>
                                    {
                                        post.image_urls.map((image,index)=>(
                                            <Link target='_blank' to={image} key={index} className='relative group'>
                                                <img src={image} key={index} alt="" className='w-64 aspect-video object-cover'/>
                                                <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>Posted {moment(post.createdAt).fromNow()}</p>
                                            </Link>
                                        ))
                                    }
                                </>
                            ))
                        }
                    </div>
                )}
                {/* Likes */}
                {activeTab === 'likes' && (
                    <div className='mt-6 flex flex-col items-center gap-6'>
                        {likedPosts.map((post)=> (
                            <PostCard 
                                key={post._id} 
                                post={post}
                                playingVideos={{}}
                                toggleVideo={() => {}}
                            />
                        ))}
                        {likedPosts.length === 0 && <p className='text-gray-500'>No liked posts</p>}
                    </div>
                )}
            </div>
        </div>
            {/* Edit profile modal */}
            {
                showEdit  && <ProfileModal setShowEdit={setShowEdit}/>
            }

    </div>
  ) : (<Loading/>)
}

export default Profile;
