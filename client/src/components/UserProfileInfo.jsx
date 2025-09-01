import { Calendar, MapPin, Pen, PenBox } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const UserProfileInfo = ({user,posts,profileId,setShowEdit}) => {
    
    return (

    <div className='relative py-4 px-6 md:px-8 bg-white'>
        <div className='flex flex-row items-start gap-4 relative'>

            <div className='w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 border-4 border-white shadow-lg absolute -top-14 left-6 md:left-8 rounded-full z-10'>
                {user.profile_picture ? (
                    <img src={user.profile_picture} alt="" className='w-full h-full object-cover rounded-full' />
                ) : (
                    <div className='w-full h-full bg-gray-300 rounded-full flex items-center justify-center'>
                        <span className='text-4xl font-bold text-gray-600'>{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                )}
            </div>
            <div className='w-full flex-1 pt-16 md:pt-16 md:pl-40'>
                <div className='flex flex-col md:flex-row items-start justify-between'>
                    <div className=''>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                               <span className='w-6 h-6 text-blue-500 bg-blue-500 rounded-full flex items-center justify-center'>
                                   <span className='text-white text-xs'>✓</span>
                               </span>
                        </div>
                        <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
                    </div>
                    {/* if user is not on others profile that means he is opening his profile so we will give edit button */}
                    {
                        !profileId  && 
                        <button onClick={()=>setShowEdit(true)} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt:0 cursor-pointer' >
                            <PenBox className='w-4 h-4'/>
                            Edit
                        </button>
                    }
                </div>
                <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>
                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
                        <span className='flex items-center gap-1.5'>
                            <MapPin className='w-4 h-4'/>
                            {
                                user.location ? user.location : 'Add location'
                            }
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4'/>
                            Joined <span>{moment(user.createdAt).fromNow()}</span>
                        </span>
                </div>
                <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
                    </div>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
                    </div>
                    <div>
                        <span className='sm:text-xl font-bold text-gray-900'>{user.following.length}</span>
                        <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UserProfileInfo;


