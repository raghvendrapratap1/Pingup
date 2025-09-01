import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchConnections } from '../features/connections/connectionsSlice'
import { BadgeCheck, UserPlus, Check, X, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const UserCard = ({ user, onUserUpdate }) => {
    const [loading, setLoading] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false)
    const dispatch = useDispatch()

    // Debug: Log state changes
    useEffect(() => {
        console.log(`🔄 UserCard ${user?.full_name}: isFollowing = ${isFollowing}`)
    }, [isFollowing, user?.full_name])

    const handleConnectionRequest = async () => {
        try {
            setLoading(true)
            const { data } = await api.post('/api/user/connect', { id: user._id })
            if (data.success) {
                toast.success(data.message)
                if (onUserUpdate) onUserUpdate()
                // Refresh connections in Redux store
                dispatch(fetchConnections())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error sending connection request:', error)
            toast.error('Failed to send connection request')
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptRequest = async () => {
        try {
            setLoading(true)
            const { data } = await api.post('/api/user/accept', { id: user._id })
            if (data.success) {
                toast.success(data.message)
                if (onUserUpdate) onUserUpdate()
                // Refresh connections in Redux store
                dispatch(fetchConnections())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error accepting connection request:', error)
            toast.error('Failed to accept connection request')
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        try {
            setFollowLoading(true)
            const { data } = await api.post('/api/user/follow', { id: user._id })
            if (data.success) {
                setIsFollowing(true)
                console.log('✅ Follow successful, setting isFollowing to true')
                toast.success(data.message || 'User followed successfully!')
                // Don't call onUserUpdate immediately to preserve local state
                // if (onUserUpdate) onUserUpdate()
            } else {
                toast.error(data.message || 'Failed to follow user')
            }
        } catch (error) {
            console.error('Error following user:', error)
            toast.error('Failed to follow user')
        } finally {
            setFollowLoading(false)
        }
    }

    const handleUnfollow = async () => {
        try {
            setFollowLoading(true)
            const { data } = await api.post('/api/user/unfollow', { id: user._id })
            if (data.success) {
                setIsFollowing(false)
                console.log('✅ Unfollow successful, setting isFollowing to false')
                toast.success(data.message || 'User unfollowed successfully!')
                // Don't call onUserUpdate immediately to preserve local state
                // if (onUserUpdate) onUserUpdate()
            } else {
                toast.error(data.message || 'Failed to unfollow user')
            }
        } catch (error) {
            console.error('Error unfollowing user:', error)
            toast.error('Failed to unfollow user')
        } finally {
            setFollowLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user?.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.full_name || 'User'}
                        </p>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                        @{user?.username || 'username'}
                    </p>
                    {user?.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {user.bio}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
                {user?.connectionStatus === 'pending' ? (
                    <>
                        <button
                            onClick={handleAcceptRequest}
                            disabled={loading}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                        </button>
                        <button
                            disabled={loading}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                        </button>
                    </>
                ) : user?.connectionStatus === 'connected' ? (
                    <div className="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm font-medium text-center">
                        Connected
                    </div>
                ) : (
                    <>
                        {/* Follow Button */}
                        <button
                            onClick={isFollowing ? handleUnfollow : handleFollow}
                            disabled={followLoading}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-1 ${
                                isFollowing 
                                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                    : 'bg-pink-500 text-white hover:bg-pink-600'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                            <span>{isFollowing ? 'Followed' : 'Follow'}</span>
                        </button>
                        
                        {/* Connect Button */}
                        <button
                            onClick={handleConnectionRequest}
                            disabled={loading}
                            className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Connect</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default UserCard
