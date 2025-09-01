import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice.js';
import toast from 'react-hot-toast'
import api from '../api/axios'
import { Pencil, X, Camera, MapPin, User, AtSign, FileText } from 'lucide-react';

const ProfileModal = ({ setShowEdit }) => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.value)

    const [editForm, setEditForm] = useState({
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: null,
        cover_photo: null,
        full_name: user.full_name
    })

    const handleSaveProfile = async () => {
        const userData = new FormData()
        const { full_name, username, bio, location, profile_picture, cover_photo } = editForm

        userData.append('username', username)
        userData.append('bio', bio)
        userData.append('location', location)
        userData.append('full_name', full_name)

        if (profile_picture) userData.append('profile', profile_picture)
        if (cover_photo) userData.append('cover', cover_photo)

        const { data } = await api.post('/api/user/update', userData)
        if (data.success) {
            dispatch(updateUser(data.user))
            setShowEdit(false)
        } else {
            toast.error(data.message)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                    <h1 className='text-2xl font-bold text-gray-900'>Edit Profile</h1>
                    <button
                        onClick={() => setShowEdit(false)}
                        className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                    >
                        <X className='w-5 h-5 text-gray-500' />
                    </button>
                </div>

                <form className='p-6 space-y-6' onSubmit={e => {
                    e.preventDefault()
                    toast.promise(handleSaveProfile(), {
                        loading: 'Saving...',
                        success: 'Profile updated successfully!',
                        error: (err) => err.message
                    })
                }}>

                    {/* Cover Photo Section */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                            <Camera className='w-4 h-4 text-indigo-600' />
                            Cover Photo
                        </label>
                        <div className='group relative'>
                            <input
                                hidden
                                type="file"
                                name="cover"
                                accept="image/*"
                                id="cover"
                                onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })}
                            />
                            <label htmlFor="cover" className='cursor-pointer block'>
                                <div className='relative w-full h-48 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors'>
                                    <img
                                        src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user.cover_photo}
                                        alt=""
                                        className='w-full h-full object-cover'
                                    />
                                    {/* Hover Overlay */}
                                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                        <div className='bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg'>
                                            <Pencil className='w-6 h-6 text-indigo-600' />
                                        </div>
                                    </div>
                                    {/* Upload Hint */}
                                    <div className='absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 font-medium'>
                                        Click to change cover photo
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Profile Picture Section */}
                    <div className='space-y-3'>
                        <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                            <User className='w-4 h-4 text-indigo-600' />
                            Profile Picture
                        </label>
                        <div className='group relative inline-block'>
                            <input
                                hidden
                                type="file"
                                name="profile"
                                accept="image/*"
                                id="profile"
                                onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0] })}
                            />
                            <label htmlFor="profile" className='cursor-pointer block'>
                                <div className='relative w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-shadow'>
                                    <img
                                        src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user.profile_picture}
                                        alt=""
                                        className='w-full h-full object-cover'
                                    />
                                    {/* Hover Overlay */}
                                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                        <div className='bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg'>
                                            <Pencil className='w-5 h-5 text-indigo-600' />
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Name Field */}
                        <div className='space-y-2'>
                            <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <User className='w-4 h-4 text-indigo-600' />
                                Full Name
                            </label>
                            <input
                                type="text"
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400'
                                placeholder='Enter your full name'
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                        </div>

                        {/* Username Field */}
                        <div className='space-y-2'>
                            <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <AtSign className='w-4 h-4 text-indigo-600' />
                                Username
                            </label>
                            <input
                                type="text"
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400'
                                placeholder='Enter username'
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Bio Field */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                            <FileText className='w-4 h-4 text-indigo-600' />
                            Bio
                        </label>
                        <textarea
                            rows={3}
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none'
                            placeholder='Tell us about yourself...'
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        />
                    </div>

                    {/* Location Field */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-700 flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-indigo-600' />
                            Location
                        </label>
                        <input
                            type="text"
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400'
                            placeholder='Enter your location'
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100'>
                        <button
                            type='button'
                            className='flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium'
                            onClick={() => setShowEdit(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileModal;
