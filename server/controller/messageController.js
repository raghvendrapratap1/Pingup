
import fs from 'fs'
import imagekit from '../config/imageKit.js';
import Message from '../models/Messages.js';

//Send Message
export const sendMessage = async(req,res)=>{
    try{
        const userId = req.userId;
        const {to_user_id,text} = req.body;
        const image= req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text' ;

        if(message_type === 'image'){
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file:fileBuffer,
                fileName:image.originalname,
            });

            media_url = imagekit.url({
                path:response.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width:'1280'}
                ]
            })
        }

        const created = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        });

        const populated = await Message.findById(created._id).populate('from_user_id to_user_id');

        res.json({success:true,message: populated});

        // Send message to recipient using Socket.IO
        const io = req.app.get('io');
        if (io) {
            // Emit to the recipient's room
            io.to(`user_${to_user_id}`).emit('newMessage', populated);
        }
     }catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

//Get Chat Message
export const getChatMessage = async (req,res)=>{
    try{
        const userId= req.userId;

        const {to_user_id} = req.body;

        const messages = await Message.find({
            $or:[
                {from_user_id: userId, to_user_id},
                {from_user_id: to_user_id, to_user_id:userId},
            ]
        }).sort({createdAt: -1});

        //Mark Messages has seen
        await Message.updateMany({from_user_id: to_user_id,to_user_id:userId},{seen:true});

        res.json({success:true,messages})
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export const getUserRecentMessages = async(req,res)=>{
    try{
        const userId = req.userId;
        // Fetch both sent and received messages for this user
        const messages = await Message.find({
            $or: [
                { to_user_id: userId },
                { from_user_id: userId },
            ]
        }).populate('from_user_id to_user_id').sort({createdAt: -1});

        res.json({success:true,messages});

    }catch(error){
        console.log(error);
        res.json({success:false,message: error.message})
    }
};

// Clear chat messages between two users
export const clearChat = async (req, res) => {
    try {
        const userId = req.userId;
        const { to_user_id } = req.params;

        if (!to_user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Delete all messages between the two users
        const result = await Message.deleteMany({
            $or: [
                { from_user_id: userId, to_user_id: to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        });

        console.log(`Cleared ${result.deletedCount} messages between users ${userId} and ${to_user_id}`);

        res.json({
            success: true,
            message: 'Chat cleared successfully',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error clearing chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear chat'
        });
    }
};