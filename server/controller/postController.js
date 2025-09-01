import fs from 'fs';
import imagekit from '../config/imageKit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

//ADD Post

export const addPost = async(req,res)=>{
    try{
        console.log('=== POST CREATION START ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('User ID:', req.userId);

        const userId = req.userId;

        const {content,post_type} = req.body;

        // Check if files exist and handle undefined case
        const files = req.files || [];
        console.log('Total files received:', files.length);
        
        const images = files.filter(file => file.mimetype && file.mimetype.startsWith('image/'));
        const videos = files.filter(file => file.mimetype && file.mimetype.startsWith('video/'));
        
        console.log('Images found:', images.length);
        console.log('Videos found:', videos.length);

        let image_urls = [];
        let video_urls = [];

        // Upload images
        if(images.length > 0){
            console.log('Starting image uploads...');
            image_urls = await Promise.all(
                images.map(async(image, index)=>{
                    try {
                        console.log(`Uploading image ${index + 1}:`, image.originalname);
                        const fileBuffer = fs.readFileSync(image.path);
                        const response = await imagekit.upload({
                            file:fileBuffer,
                            fileName:image.originalname,
                            folder:"posts",
                        })
                        
                        // For URL Generation - use direct URL from response
                        const url = response.url; // Use direct URL from response

                        console.log(`Image ${index + 1} uploaded successfully:`, url);
                        return url;
                    } catch (uploadError) {
                        console.error('Image upload error:', uploadError);
                        throw new Error(`Failed to upload image: ${image.originalname}`);
                    }
                })
            )
        }

        // Upload videos
        if(videos.length > 0){
            console.log('Starting video uploads...');
            video_urls = await Promise.all(
                videos.map(async(video, index)=>{
                    try {
                        console.log(`Uploading video ${index + 1}:`, video.originalname);
                        const fileBuffer = fs.readFileSync(video.path);
                        const response = await imagekit.upload({
                            file:fileBuffer,
                            fileName:video.originalname,
                            folder:"posts/videos",
                        })
                        
                        // For video URL Generation - use direct URL without transformations
                        const url = response.url; // Use direct URL from response

                        console.log(`Video ${index + 1} uploaded successfully:`, url);
                        return url;
                    } catch (uploadError) {
                        console.error('Video upload error:', uploadError);
                        throw new Error(`Failed to upload video: ${video.originalname}`);
                    }
                })
            )
        }

        // Determine post type if not provided
        let finalPostType = post_type;
        if (!finalPostType) {
            if (images.length > 0 && videos.length > 0 && content) {
                finalPostType = 'text_with_image_and_video';
            } else if (images.length > 0 && videos.length > 0) {
                finalPostType = 'image_and_video';
            } else if (images.length > 0 && content) {
                finalPostType = 'text_with_image';
            } else if (videos.length > 0 && content) {
                finalPostType = 'text_with_video';
            } else if (images.length > 0) {
                finalPostType = 'image';
            } else if (videos.length > 0) {
                finalPostType = 'video';
            } else {
                finalPostType = 'text';
            }
        }

        console.log('Final post type:', finalPostType);
        console.log('Image URLs:', image_urls);
        console.log('Video URLs:', video_urls);

        const postData = {
            user: userId,
            content: content || '',
            image_urls,
            video_urls,
            post_type: finalPostType
        };

        console.log('Creating post with data:', postData);

        const newPost = await Post.create(postData);
        console.log('Post created successfully:', newPost._id);

        res.json({success:true,message:"Post created successfully", post: newPost})
    }catch(error){
        console.error('Post creation error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to create post'})
    }
};

//GET POST

export const getFeedPosts  = async(req,res)=>{
    try{
        const userId = req.userId;
        const user=await User.findById(userId);

        const userIds=[userId,...user.connections,...user.following];
        const posts = await Post.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1});

        res.json({success:true,posts});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
};

// GET posts liked by a user
export const getLikedPosts = async(req,res)=>{
    try{
        const userId = req.query.userId || req.userId;
        if(!userId) return res.json({success:false,message:'User id required'});
        const posts = await Post.find({ likes_count: { $in: [String(userId)] } }).populate('user').sort({createdAt: -1});
        res.json({success:true,posts});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

//LIKE POSTS


export const likePost  = async(req,res)=>{
    try{
        const userId = req.userId;
        
        const {postId} = req.body;

        const post =await Post.findById(postId);

        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user =>user!== userId);

            await post.save();
            res.json({success:true,message:'Post unliked'});
        }else{
            post.likes_count.push(userId);
            await post.save();
            res.json({success:true,message:'Post Liked'});
        }
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
};

// COMMENTS
export const getPostComments = async(req,res)=>{
    try{
        const { postId } = req.query;
        const post = await Post.findById(postId).populate('comments.user');
        if(!post) return res.json({success:false,message:'Post not found'});
        res.json({success:true,comments: post.comments || []});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

export const addPostComment = async(req,res)=>{
    try{
        const userId = req.userId;
        const { postId, text } = req.body;
        if(!text || !text.trim()) return res.json({success:false,message:'Comment cannot be empty'});
        const post = await Post.findById(postId);
        if(!post) return res.json({success:false,message:'Post not found'});
        const comment = { user: userId, text, createdAt: new Date() };
        post.comments = Array.isArray(post.comments) ? post.comments : [];
        post.comments.push(comment);
        await post.save();
        await post.populate('comments.user');
        res.json({success:true,message:'Comment added',comments: post.comments});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}
// DELETE POST
export const deletePost = async(req,res)=>{
    try{
        const userId = req.userId;
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({success:false,message:'Post not found'});
        }
        if(String(post.user) !== String(userId)){
            return res.status(403).json({success:false,message:'Not authorized to delete this post'});
        }

        // Delete media from ImageKit if exists
        if(post.image_urls && post.image_urls.length > 0){
            try{
                for(const imageUrl of post.image_urls){
                    if(imageUrl){
                        const urlParts = imageUrl.split('/');
                        const fileName = urlParts[urlParts.length - 1];
                        await imagekit.deleteFile(fileName);
                        console.log(`🗑️ Image deleted from ImageKit: ${fileName}`);
                    }
                }
            }catch(mediaError){
                console.log('Image deletion error:', mediaError.message);
            }
        }

        if(post.video_urls && post.video_urls.length > 0){
            try{
                for(const videoUrl of post.video_urls){
                    if(videoUrl){
                        const urlParts = videoUrl.split('/');
                        const fileName = urlParts[urlParts.length - 1];
                        await imagekit.deleteFile(fileName);
                        console.log(`🗑️ Video deleted from ImageKit: ${fileName}`);
                    }
                }
            }catch(mediaError){
                console.log('Video deletion error:', mediaError.message);
            }
        }

        await Post.findByIdAndDelete(postId);
        console.log(`🗑️ Post deleted: ${postId}`);
        return res.json({success:true,message:'Post deleted successfully'});
    }catch(error){
        console.error('Delete post error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to delete post'});
    }
}

// DELETE COMMENT
export const deleteComment = async(req,res)=>{
    try{
        const userId = req.userId;
        const { postId, commentId } = req.params;
        
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({success:false,message:'Post not found'});
        }

        // Find the comment
        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(404).json({success:false,message:'Comment not found'});
        }

        // Check if user can delete comment (comment owner or post owner)
        if(String(comment.user) !== String(userId) && String(post.user) !== String(userId)){
            return res.status(403).json({success:false,message:'Not authorized to delete this comment'});
        }

        // Remove the comment
        post.comments = post.comments.filter(c => String(c._id) !== String(commentId));
        await post.save();

        console.log(`🗑️ Comment deleted: ${commentId} from post: ${postId}`);
        return res.json({success:true,message:'Comment deleted successfully'});
    }catch(error){
        console.error('Delete comment error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to delete comment'});
    }
}