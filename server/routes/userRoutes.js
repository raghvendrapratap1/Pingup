import express from 'express';
import { acceptConnectionRequest, discoversUsers, followUser, getUserConnections, getUserData,getUserProfiles,logoutUser,sendConnectionRequest,unfollowUser,updateUserData,deleteAccount } from '../controller/userController.js';
import  upload  from '../config/multer.js';
import auth from '../middleware/auth.js';


import register from '../controller/register.js';
import login from '../controller/login.js';
import getUser from '../controller/getUser.js';
import logout from '../controller/logout.js';
import getAccess from '../controller/getAccess.js';
import forgotPassword from '../controller/forgotPassword.js';
import verifyOtp from '../controller/verifyOtp.js';
import getTime from '../controller/getTime.js';
import updatePassword from '../controller/updatePassword.js';
import { getUserRecentMessages } from '../controller/messageController.js';

const router=express.Router();

router.post('/register',register);
router.post('/login',login)
router.get('/profile',auth,getUser);
router.get('/logout',logout);
router.get('/access',auth,getAccess);
router.post('/forgot-password',forgotPassword);
router.post('/otp-verify',verifyOtp);
router.post('/otp/time',getTime);
router.post ('/update-password',updatePassword);


//User Operations
router.get('/data',auth,getUserData);

router.post(
  '/update',
  auth,
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  updateUserData
);

router.post('/discover',auth,discoversUsers);
router.post('/follow',auth,followUser);
router.post('/unfollow',auth,unfollowUser);


// Logout route
router.post('/logout', auth,logoutUser);

// Delete account route
router.delete('/delete-account', auth, deleteAccount);

router.post('/connect',auth,sendConnectionRequest);
router.post('/accept',auth,acceptConnectionRequest);
router.get('/connections',auth,getUserConnections);
router.post('/profile',auth,getUserProfiles);
router.post('/recent-messages',auth,getUserRecentMessages);

export default router;



