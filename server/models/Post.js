import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
},{_id:true});

const postSchema = new mongoose.Schema({
    user:{type: String,ref:'User',required:true},
    content:{type:String},
    image_urls:[{type:String}],
    video_urls:[{type:String}],
    post_type:{
        type:String, 
        enum:[
            'text',
            'image',
            'video',
            'text_with_image',
            'text_with_video',
            'image_and_video',
            'text_with_image_and_video'
        ],
        required:true
    },
    likes_count:[{type: String,ref:'User'}],
    comments:[commentSchema]
},{timestamps:true,minimize:false})

const Post=mongoose.model('Post',postSchema);

export default Post;