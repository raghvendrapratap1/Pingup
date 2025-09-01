import User from "../models/User.js";

const getUser=async(req,res,next)=>{
    const email=req.email;
    try{
        const findedUser = await User.findOne({email:email});
        res.status(200).json(
            {
                message:'success',
                status:true,
                user:{
                    name:findedUser.name,
                    email:findedUser.email
                }
            }
        );


    }catch(error){
        next(error);
    }
}

export default getUser;
