import { CirclePlus, LogOut, ChevronDown, Trash2, User } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets, dummyUserData } from '../assets/assets';
import MenuItems from './MenuItems';
import apis from '../utils/apis';
import httpAction from '../utils/httpAction';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../features/user/userSlice';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const user = useSelector((state)=>state.user.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: 'Logout?',
        text: "Are you sure you want to logout?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!'
      });

      if (result.isConfirmed) {
        const data = { 
          url: apis().logoutUser,
          method: "GET"
        };
        const result2 = await httpAction(data);
        if (result2?.status) {
          // Don't show toast after logout since user state will be cleared
          dispatch(clearUser());
          navigate("/login", { replace: true });
        } else {
          // Even if server fails, clear local state and redirect
          dispatch(clearUser());
          navigate("/login", { replace: true });
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      dispatch(clearUser());
      navigate("/login", { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await Swal.fire({
        title: 'Delete Account?',
        text: "This action cannot be undone! All your data will be permanently deleted.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete my account!',
        input: 'password',
        inputLabel: 'Enter your password to confirm',
        inputPlaceholder: 'Password',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to enter your password!'
          }
        }
      });

      if (result.isConfirmed) {
        try {
          const { data } = await api.delete('/api/user/delete-account', {
            data: { password: result.value }
          });

          if (data.success) {
            // Don't show toast after account deletion since user state will be cleared
            dispatch(clearUser());
            navigate("/login", { replace: true });
          } else {
            toast.error(data.message || 'Failed to delete account');
          }
        } catch (error) {
          console.error('Delete account error:', error);
          if (error.response?.status === 401) {
            toast.error('Incorrect password');
          } else {
            toast.error('Failed to delete account');
          }
        }
      }
    } catch (error) {
      console.error("Delete account error:", error);
    }
  };

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
      } transition-all duration-300 ease-in-out`}
    >
      {/* Top section */}
      <div className="w-full">
        <img
          onClick={() => navigate('/')}
          src={assets.logo}
          alt="Logo"
          className="w-26 ml-7 my-2 cursor-pointer"
        />

        <hr className="border-gray-300 mb-8" />
        <MenuItems setSidebarOpen={setSidebarOpen} />

        {/* Create Post Button */}
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-800 hover:to-indigo-700 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className='w-5 h-5' />
          Create Post
        </Link>
      </div>

      {/* Bottom section */}
      <div className="w-full border-gray-200 p-4 px-7">
        <div ref={userMenuRef} className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex gap-2 items-center">
              {/* Avatar circle with first letter */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div>
                <h1 className="text-sm font-medium">{user?.full_name || 'User'}</h1>
                <p className="text-xs text-gray-500">@{user?.username || 'username'}</p>
              </div>
            </div>

            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

