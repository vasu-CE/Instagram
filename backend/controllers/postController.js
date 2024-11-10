import sharp from "sharp";
// import cloudinary from "../utils/cloudinary";
import PostModel from "../models/PostModel.js";
import { userModel } from "../models/userModel.js";
import { CommentModel } from "../models/CommentModel.js";
import { getReciverSocketId ,io } from "../socket/socket.js";

export const addNewPost = async (req,res) => {   
    try{
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;
        
        if(!image) return res.status(401).json({ message : "image required" });

        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        // const cloudResponce = await cloudinary.uploader.upload(fileUri);

        const post = await PostModel.create({
            caption,
            image : fileUri,
            author : authorId
        })

        const user = await userModel.findById(authorId);
        if(user){
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({path:'author',select:'-password'});
        
        return res.status(201).json({
            message : "new post added",
            post,
            success : true,
        })
    }catch(err){
        console.log(err.message);
        
    }
}

export const getAllPost = async (req,res) => {
    try{
        const posts = await PostModel.find().sort({createdAt:-1})
        .populate({path:'author' , select:'userName , profilePicture'})
        .populate({
            path:'comments',
            sort : {createdAt:-1},
            populate:{
                path:'author',
                select:'userName , profilePicture'
            }
        });

        return res.status(200).json({
            posts,
            success : true
        })

    }catch(err){
        console.log(err.message);
        
    }
};

export const getMyPost = async (req,res) => {
    try{
        const authorId = req.id;
        const posts = await PostModel.find({author:authorId}).sort({createdAt:-1})
        .populate({path : 'author',select : 'userName , profilePicture'})
        .populate({
            path:'comments',
            sort : {createdAt:-1},
            populate:{
                path:'author',
                select:'userName , profilePicture'
            }
        });

        return res.status(200).json({
            posts,
            success : true
        })
    }catch(err){
        console.log(err.message);
        
    }
}

export const likePost = async (req,res) => {
    try{
        const likekarnevala = req.id;
        const postId = req.params.id;

        const post = await PostModel.findById(postId);
        if(!post) return res.status(401).json({message : 'Post not found',success : false })
        
        await post.updateOne({$addToSet:{ likes : likekarnevala }}); //one user can one like

        await post.save();

        //socekt io for real time notification
        const user = await userModel.findById(likekarnevala).select('userName profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId === likekarnevala){
            //notification event
            const notification = {
                type : 'like',
                userId : likekarnevala,
                userDetails : user,
                message : "Your post was liked"
            }
            const PostOwnerSocketId = getReciverSocketId(postOwnerId);
            io.to(PostOwnerSocketId).emit('notification' , notification);
        }

        return res.status(200).json({ message : 'Post liked' , success:true});
    }catch(err){
        console.log(err.message);
        
    }
}


export const dislikePost = async (req,res) => {
    try{
        const disLikeKarnewala = req.id;
        const postId = req.params.id;

        const post = await PostModel.findById(postId);
        if(!post) return res.status(401).json({message : 'Post not found',success : false })
        
        await post.updateOne({$pull:{ likes : disLikeKarnewala }}); //one user can one like

        await post.save();

        //socekt io for real time notification
        const user = await userModel.findById(disLikeKarnewala).select('userName profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId === disLikeKarnewala){
            //notification event
            const notification = {
                type : 'dislike',
                userId : disLikeKarnewala,
                userDetails : user,
                message : "Your post was disliked"
            }
            const PostOwnerSocketId = getReciverSocketId(postOwnerId);
            io.to(PostOwnerSocketId).emit('notification' , notification);
        }
        return res.status(200).json({ message : 'Post disliked' , success:true});
    }catch(err){
        console.log(err.message);
        
    }
}

export const addComment = async (req,res) => {
    // console.log("Hello");
    try{
        const postId = req.params.id;
        const commentsUserId = req.id;

        const {text} = req.body;
        const post = await PostModel.findById(postId);
        if(!text) return res.status(400).json({message : 'text is required' , success : false});

        const comment = await CommentModel.create({
            text,
            author : commentsUserId,
            post : postId
        })

        await comment.populate({path : 'author' , select:'userName profilePicture'});
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message : 'comment added',
            comment,
            success : true
        })

    }catch (err) {
        console.error(err.message); 
        return res.status(500).json({ message: 'An unexpected error occurred', success: false });
    }
}


export const getCommentsOfPost = async (req,res) => {
    try{    
        const postId = req.params.id;
        const comments = await CommentModel.find({post : postId})
        .populate('author' , 'userName , profilePicture');

        if(!comments){
            return res.status(404).json({
                message : 'no comments found',
                success : false
            })
        }

        return res.status(200).json({
            success : true,
            comments
        })
    }catch(err){
        console.log(err.message);
        
    }
}


export const deletePost = async (req,res) => {
    try{
        const postId = req.params.id;
        const authorId = req.id;

        const post = await PostModel.findById(postId);
        if(!post) return res.status(404).json({ message : 'post not found' , success : false});

        if(post.author.toString() != authorId){
            return res.status(403).json({message : 'unauthorized'});
        }

        await PostModel.findByIdAndDelete(postId);
        let user = await userModel.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() != postId);
        await user.save();

        await CommentModel.deleteMany({post : postId});

        return res.status(200).json({
            success : true,
            message : 'post deleted'
        })

    }catch(err){
        console.log(err.message);   
    }
}


export const bookmarkPost = async (req,res) => {
    try{
        const postId = req.params.id;
        const authorId = req.id;

        const post =await PostModel.findById(postId);
        if(!post) return res.status(404).json({message : 'post not found' , success : false})

        const user = await userModel.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            //already bookmarked => remove from bookmarks
            await user.updateOne({$pull : {bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type : 'unsave' , message : 'reemove from bookmarks' , success : true});
        }else{
            await user.updateOne({$addToSet : {bookmarks : post._id}});
            await user.save();
            return res.status(200).json({type : 'unsave' , message : 'post bookmarks' , success : true});
        }
    }catch(err){
        console.log(err.message);  
    }
}