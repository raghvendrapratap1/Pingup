import fs from 'fs';
import imagekit from '../config/imageKit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

//ADD Post

export const addPost = async(req,res)=>{
    try{
        const userId = req.userId;
        const {content,post_type} = req.body;

        // Allow two modes:
        // 1) Direct media URLs provided by client (recommended for large files)
        // 2) Multipart file upload via req.files
        
        let image_urls = [];
        let video_urls = [];

        // Pick URLs if provided in JSON body (array or JSON string)
        const parseMaybeArray = (val) => {
            if(!val) return [];
            if(Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch { return []; }
        };
        const bodyImageUrls = parseMaybeArray(req.body?.image_urls);
        const bodyVideoUrls = parseMaybeArray(req.body?.video_urls);

        if(bodyImageUrls.length > 0 || bodyVideoUrls.length > 0){
            image_urls = bodyImageUrls;
            video_urls = bodyVideoUrls;
        } else {
            // Fallback to handling uploaded files (small payloads)
            const files = req.files || [];
            const images = files.filter(file => file.mimetype && file.mimetype.startsWith('image/'));
            const videos = files.filter(file => file.mimetype && file.mimetype.startsWith('video/'));

            // Upload images
            if(images.length > 0){
                image_urls = await Promise.all(
                    images.map(async(image)=>{
                        try {
                            const fileBuffer = image.buffer || (image.path ? fs.readFileSync(image.path) : null);
                            if(!fileBuffer) throw new Error('Invalid image buffer');
                            const response = await imagekit.upload({
                                file:fileBuffer,
                                fileName:image.originalname,
                                folder:"posts",
                            })
                            return response.url;
                        } catch (uploadError) {
                            throw new Error(`Failed to upload image: ${image.originalname}`);
                        }
                    })
                )
            }

            // Upload videos
            if(videos.length > 0){
                video_urls = await Promise.all(
                    videos.map(async(video)=>{
                        try {
                            const fileBuffer = video.buffer || (video.path ? fs.readFileSync(video.path) : null);
                            if(!fileBuffer) throw new Error('Invalid video buffer');
                            const response = await imagekit.upload({
                                file:fileBuffer,
                                fileName:video.originalname,
                                folder:"posts/videos",
                            })
                            return response.url;
                        } catch (uploadError) {
                            throw new Error(`Failed to upload video: ${video.originalname}`);
                        }
                    })
                )
            }
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

        const postData = {
            user: userId,
            content: content || '',
            image_urls,
            video_urls,
            post_type: finalPostType
        };

        const newPost = await Post.create(postData);

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
        res.json({success:false,message:error.message});
    }
}

// UPDATE COMMENT (only by comment owner)
export const updateComment = async(req,res)=>{
    try{
        const userId = req.userId;
        const { postId, commentId } = req.params;
        const { text } = req.body;

        if(!text || !text.trim()){
            return res.status(400).json({success:false,message:'Comment cannot be empty'});
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({success:false,message:'Post not found'});
        }

        const comment = post.comments.id(commentId);
        if(!comment){
            return res.status(404).json({success:false,message:'Comment not found'});
        }

        // Only the comment author can edit
        if(String(comment.user) !== String(userId)){
            return res.status(403).json({success:false,message:'Not authorized to edit this comment'});
        }

        comment.text = text.trim();
        await post.save();
        await post.populate('comments.user');

        return res.json({success:true,message:'Comment updated', comments: post.comments});
    }catch(error){
        console.error('Update comment error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to update comment'});
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
                    }
                }
            }catch(mediaError){
                // Image deletion error
            }
        }

        if(post.video_urls && post.video_urls.length > 0){
            try{
                for(const videoUrl of post.video_urls){
                    if(videoUrl){
                        const urlParts = videoUrl.split('/');
                        const fileName = urlParts[urlParts.length - 1];
                        await imagekit.deleteFile(fileName);
                    }
                }
            }catch(mediaError){
                // Video deletion error
            }
        }

        await Post.findByIdAndDelete(postId);
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

        // Only the comment author can delete
        if(String(comment.user) !== String(userId)){
            return res.status(403).json({success:false,message:'Not authorized to delete this comment'});
        }

        // Remove the comment
        post.comments = post.comments.filter(c => String(c._id) !== String(commentId));
        await post.save();

        return res.json({success:true,message:'Comment deleted successfully'});
    }catch(error){
        console.error('Delete comment error:', error);
        res.status(500).json({success:false,message:error.message || 'Failed to delete comment'});
    }
}