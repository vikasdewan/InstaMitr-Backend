import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";



export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !username || !password) {
      return res.status(401).json({
        message: "something is Missing , please Check",
        success: false,
      });
    }

    const user = await User.findOne({ email, username });
    if (user) {
      return res.status(401).json({
        message: "User already exist with same email id",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //10  is like how much hard do you want to make password hashed , it called saltValue
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully",
      success : true
    });
  } catch (error) {
    console.log(error);
  }
};


export const login = async (req,res) =>{
    try {

        const {email, password}  = req.body;
        if(!email || !password){
            return res.status(401).json({
                message: "something is missing , please Check",
                status : false
            })
        }
        
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: "Incorrect email or password",
                status : false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message: "Incorrect email or password",
                status : false
            });
        }

        user = {
            _id : user._id,
            username : user.username,
            email : user.email,
            profileImage : user.profileImage,
            bio : user.bio,
            followers : user.followers,
            following : user.following,
            posts : user.posts
        }
        
        const token  = await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn : '5d'});

        return res.cookie('token',token,{httpOnly : true,sameSite:'strict',maxAge : 5*24*60*60*1000}).json({
            message : `Welcome Back ${user.username}`,
            success : true,
            user
        })

    } catch (error) {
        console.log(error)
    }
}


export const logout = async(_,res)=>{
    try {
        return res.cookie("token","",{maxAge : 0}).json({message : "logged out successfully",status : true})     
    } catch (error) {
        console.log(error)
    }

}


export const getProfile = async(req,res)=>{
    try {
        
        const userId = req.params.id;
        let user = await User.findById(userId);
        return res.status(200).json({
            user,
            success : true
        })
        
    } catch (error) {
        console.log(error)
    }
}

export const editProfile = async(req,res) =>{
    try {
        
        const userId = req.id;
        const {bio,username} = req.body;
        const profileImage = req.file;


        let cloudResponse;

        if(profileImage){
             const fileUri = getDataUri(profileImage);
             cloudResponse = await cloudinary.uploader.upload(fileUri);

        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message : "user not found",
                success : false
            })
        }

        if(bio) user.bio = bio;
        if(username) user.username = username;
        if(profileImage) user.profileImage = cloudResponse.secure_url;

        await user.save();

        return  res.status(200).json({
            message : "Profile updated successfully",
            success : true,
            user
        })


    } catch (error) {
        console.log(error)
    }
}