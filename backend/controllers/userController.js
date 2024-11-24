import {userModel} from "../models/userModel.js";
import bcrypt from "bcryptjs";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
// const cloudinary = require('../utils/cloudinary.js')
import jwt from "jsonwebtoken";
import upload from "../middlewares/multer.js";
import postModel from "../models/PostModel.js"
import sharp from "sharp";

export const register = async (req,res) => {
    try{
        const {userName, email ,password} = req.body;
        const user = await userModel.findOne({email});
        
        if(user){
            return res.status(401).json({
                message :"user already exist",
                success:false
            })
        };

        const hash = await bcrypt.hash(password,10);
        await userModel.create({
            userName,
            email,
            password:hash
        });
        return res.status(201).json({
            message : "Account created successfully",
            success:true
        })
    } catch(err){
        console.log(err);
    }
};

export const login = async (req,res) => {
    try{
        const {email,password} = req.body;

        let user = await userModel.findOne({email});

        if(!user){
            return res.status(401).json({
                message :"Incorrect email or password",
                success : false
            })
        };

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(401).json({
                message :"Incorrect email or password",
                success : false
            });
        }
        
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
        const populatedPost = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await postModel.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id:user._id,
            userName:user.userName,
            email : user.email,
            profilePicture : user.profilePicture,
            bio : user.bio,
            followers : user.followers,
            following : user.following,
            posts : populatedPost
        }
        // console.log(user);
        //  Generate a JWT token

        // Set the token in a cookie and send the response
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.userName} 👋`,
            success: true,
            user
        });
    } catch(err){
        console.error(err);  // Log the error for debugging purposes
        return res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
            success: false
        });
    }
};


export const logout = async (req,res) => {
    try{
        return res.cookie("token" , "").json({
            message : "Logged out",
            success:true 
        })
    }catch(err){
        console.log(err);
        
    }
};

export const getProfile = async (req,res) => {
    try{   
        const userId = req.params.id;
        // console.log(userId);
        
        let user = await userModel.findById(userId)
        .populate({path : 'posts' , createdAt:-1})
        .populate('bookmarks');
        // console.log(user);
        
        return res.status(200).json({
            user,
            success:true
        })
    }catch(err){
        console.log(err);
    }
};

export const editProfile = async (req, res) => {
    const userId = req.id;
    const { gender, bio } = req.body;

    try {
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
                success: false
            });
        }

        let profilePicture = req.file;

        if (profilePicture) {
            try {
                const optimizedImageBuffer = await sharp(profilePicture.buffer)
                    .resize({ width: 800, height: 800, fit: 'inside' })
                    .toFormat('jpeg', { quality: 80 })
                    .toBuffer();

                const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
                user.profilePicture = fileUri;
            } catch (imageProcessingError) {
                console.error("Error processing image:", imageProcessingError);
                return res.status(500).json({
                    message: "Failed to process image",
                    success: false,
                    error: imageProcessingError.message,
                });
            }
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({
            message: "Server error",
            success: false,
            error: err.message,
        });
    }
};


export const getSuggestedUsers = async (req,res)=>{
    try{
        // console.log(req.id);
        
        const SuggestedUsers = await userModel.find({_id : {$ne:req.id}}).select("-password");
        if(!SuggestedUsers){
            return res.status(400).json({
                message : "Currently do not have any users"
            })
        };

        return res.status(200).json({
            success : true,
            user : SuggestedUsers
        })
    }catch(err){
        console.log(err);
        
    }
};

export const followOrUnfollow = async (req,res) => {
    try{
        const myid = req.id;             //follow karne wala
        const another = req.params.id;   //jisko follow krna hain

        if(myid === another){
            return res.status(400).json({
                message : "You can't follow or unfollow yourself",
                success :false
            })
        };

        const user = await userModel.findById(myid);
        const target = await userModel.findById(another);

        if(!user || !target){
            return res.status(400).json({
                message : 'User not found',
                success : true
            });
        }

        const isFollowing = user.following.includes(another);
        if(isFollowing){
            //unfollow
            await Promise.all([
                userModel.updateOne({_id : myid} ,{$pull:{following:another}}),
                userModel.updateOne({_id : another} , {$pull : {followers : myid}})
            ])

            return res.status(200).json({
                message : "Unfollow successfully",
                success : true
            })
        } else{
            //follow
            //use promiss.all when handle two document at a time 
            await Promise.all([
                userModel.updateOne({_id:myid},{$push:{following:another}}),
                userModel.updateOne({_id:another},{$push:{followers:myid}})
            ]);  

            return res.status(200).json({
                message : "Follow successfully",
                success : true
            })
        }
    }catch(err){
        console.log(err);  
    }
}