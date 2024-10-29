import {Post} from "../models/post.model.js"
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"

export const addNewPost = async(req,res)=>{
    try {
        
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;


        if(!image){
            return res.status(400).json({
                message : "Image Required",
                status : false
            })
        }

        //image upload
        const optimizeImageBuffer = await sharp(image.buffer)
        .resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer(); 

        //buffer to Data Uri
        const flieUri = `data:image/jpeg;base64,${optimizeImageBuffer.toString('base64')}`
        
        const cloudResponse = await cloudinary.uploader.upload(flieUri);

        const post = await Post.create({
            caption,
            image : cloudResponse.secure_url,
            author : authorId
        })

        const user = await User.findById(authorId);

        if(user){
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({path : 'author',select : '-password'});

        return res.status(201).json({
            message: "New Post Added",
            post,
            success : true
        })

    } catch (error) {
        console.log(error);
    }
}


export const getAllPost = async(req,res){
    try {
        
        const post = await Post
        .find()
        .sort({createdAt : -1})
        .populate({path : 'author',select:'username,profileImage'});

    } catch (error) {
        console.log(error);
    }
}