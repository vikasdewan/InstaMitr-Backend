import { Post } from "../models/post.model.js";
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                message: "Image Required",
                status: false,
            });
        }

        //image upload
        const optimizeImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        //buffer to Data Uri
        const flieUri = `data:image/jpeg;base64,${optimizeImageBuffer.toString(
            "base64"
        )}`;

        const cloudResponse = await cloudinary.uploader.upload(flieUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
        });

        const user = await User.findById(authorId);

        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: "author", select: "-password" });

        return res.status(201).json({
            message: "New Post Added",
            post,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username,profileImage" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: {
                    path: "author",
                    select: "username,profileImage",
                },
            });

        return res.status(200).json({
            posts,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username, profileImage" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: {
                    path: "author",
                    select: "username,profileImage",
                },
            });

        return res.status(200).json({
            posts,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "post Not found",
                success: false,
            });
        }

        //like logic started

        //$addToSet use to not add things more than once , like a Set Data Structure
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });

        await post.save();

        //implement socket io for real time notification

        return res.status(200).json({
            message: "Post Liked",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const dislikePost = async (req, res) => {
    try {
        const dislikeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "post Not found",
                success: false,
            });
        }

        //dislike logic started

        //$addToSet use to not add things more than once , like a Set Data Structure
        await post.updateOne({ $pull: { likes: dislikeKrneWalaUserKiId } });

        await post.save();

        //implement socket io for real time notification

        return res.status(200).json({
            message: "Post DisLiked",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUsrKiId = req.id;

        const { text } = req.body;
        const post = await Post.findById(postId);

        if (!text) {
            return res.status(400).json({
                message: "text is required",
                success: false,
            });
        }

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUsrKiId,
            post: postId,
        }).populate({
            path: "author",
            select: "username,profileImage",
        });

        post.comments.push(comment._id);

        await post.save();

        return res.status(201).json({
            message: "comment Added",
            comment,
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};


export const getCommentsOfPost = async (req, res) => {
    try {

        const postId = req.params.id;

        const comments = await Comment
            .find({ post: postId })
            .populate('author', 'username,profileImage')

        if (!comments) return res.status(404).json({ message: "no comments are there for this post", success: true })

        return res.status(200).json({ success: true, comments })

    } catch (error) {

        console.log(error);
    }
}


export const deletePost = async (req, res) => {
    try {

        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "post not exist",
                success: false
            })
        }

        //check that the logged in user is the owner/author of the post

        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                message: "not access to delete the post / unauthorised",
                success: false
            })
        }

        //delete post

        await Post.findByIdAndDelete(postId);

        //remove the post id from the user's posts
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        //delete associated comments
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: "post Deleted",
            success: true
        })


    } catch (error) {
        console.log(error)
    }
}


export const bookmarkPost = async (req, res) => {
    try {

        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ 
            message: "post Not found", 
            success: false })

        const user = await User.findById(authorId);

        if (user.bookmarks.includes(post._id)) {
            //already bookmarked , then we have to unbookmark the post
            await user.updateOne({ $pull: { bookmarks: post_id } });
            await user.save();
            return res.status(200).json({ 
                type: 'unsaved', 
                message: 'post removed from book mark', 
                success: true })
        }
        else {
            await user.updateOne({ $addToSet: { bookmarks: post_id } });
            await user.save();
            return res.status(200).json({ 
                type: 'saved', 
                message: 'post bookmarked', 
                success: true });
        }
 
    } catch (error) {
        console.log(error);
    }
}