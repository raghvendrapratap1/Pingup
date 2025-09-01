import fs from 'fs';
import imagekit from '../config/imageKit.js';
import User from '../models/User.js';
import Story from '../models/Story.js';
import storyQueue from '../queues/storyQueue.js';

//ADD USER STORY
export const addUserStory=async(req,res)=>{
    try{
        const userId = req.userId;
        const {content,media_type,background_color} = req.body;
        const media = req.file;
        let media_url ='';

        //UPLOAD MEDIA TO IMAGEKIT
        if(media_type == 'image'  || media_type == 'video'){
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file:fileBuffer,
                fileName:media.originalname,
            })
            media_url = response.url;
        }
        const story = await Story.create({
            user:userId,
            content,
            media_url,
            media_type,
            background_color
        });

        //schedule story deletion after 24 hours
        await storyQueue.add(
            { storyId: story._id },
            { delay: 24 * 60 * 60 * 1000 } // 24 hours
            // { delay: 10 * 1000 } // 10 seconds
            
        );
        console.log(`📅 Story deletion scheduled for ${story._id} in 24 hours`);


        res.json({success:true,message:'Story Added'});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


//GET STORY
export const getStories=async(req,res)=>{
    try{
        const userId = req.userId;
        
        const user = await User.findById(userId);

        //User connection and followings

        const userIds = [userId,...user.connections,...user.following];

        // Calculate cutoff time for last 24 hours
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Optional: cleanup any lingering stories older than 24 hours
        try{
            await Story.deleteMany({ createdAt: { $lt: cutoffDate } });
        }catch(cleanError){
            console.log('Story cleanup error:', cleanError.message);
        }

        const stories = await Story.find({
            user: { $in: userIds },
            createdAt: { $gte: cutoffDate }
        }).populate('user').sort({createdAt:-1});

        res.json({success:true,stories});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

// LIKE/UNLIKE STORY
export const likeStory = async(req,res)=>{
    try{
        const userId = req.userId;
        const {storyId} = req.body;
        const story = await Story.findById(storyId);
        if(!story){
            return res.json({success:false,message:'Story not found'});
        }
        if(Array.isArray(story.likes_count) && story.likes_count.includes(userId)){
            story.likes_count = story.likes_count.filter(id=>id!==userId);
            await story.save();
            return res.json({success:true,message:'Story unliked'});
        }
        story.likes_count = Array.isArray(story.likes_count) ? story.likes_count : [];
        story.likes_count.push(userId);
        await story.save();
        return res.json({success:true,message:'Story liked'});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

// DELETE STORY
export const deleteStory = async(req,res)=>{
    try{
        const userId = req.userId;
        const {storyId} = req.params;
        
        const story = await Story.findById(storyId);
        
        if(!story){
            return res.status(404).json({success:false,message:'Story not found'});
        }
        
        // Check if user owns the story
        if(story.user.toString() !== userId){
            return res.status(403).json({success:false,message:'You can only delete your own stories'});
        }
        
        // Delete media from ImageKit if exists
        if(story.media_url && story.media_type !== 'text'){
            try{
                // Extract file ID from URL for deletion
                const urlParts = story.media_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                
                // Delete from ImageKit
                await imagekit.deleteFile(fileName);
                console.log(`🗑️ Media deleted from ImageKit: ${fileName}`);
            }catch(mediaError){
                console.log('Media deletion error:', mediaError.message);
                // Continue with story deletion even if media deletion fails
            }
        }
        
        // Remove from story queue if exists
        try{
            const jobs = await storyQueue.getJobs(['delayed', 'waiting']);
            const storyJob = jobs.find(job => job.data.storyId === storyId);
            if(storyJob){
                await storyJob.remove();
                console.log(`🗑️ Story job removed from queue: ${storyId}`);
            }
        }catch(queueError){
            console.log('Queue removal error:', queueError.message);
        }
        
        // Delete story from database
        await Story.findByIdAndDelete(storyId);
        
        console.log(`🗑️ Story deleted: ${storyId}`);
        res.json({success:true,message:'Story deleted successfully'});
        
    }catch(error){
        console.error('Delete story error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to delete story'});
    }
}

