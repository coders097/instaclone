const express=require('express');
const router=express.Router();
const jwtVerify=require('../middlewares/jwtAuthentication');
const E=require("../utils/errors");
const fs=require('fs');
const path=require('path');
const postTable=require('./Post').__postTable;
console.log(postTable);

// Models
const User=require('../models/User');
const Like=require('../models/Like');
const Comment=require('../models/Comment');
const Connection=require('../models/Connection');
const Post = require('../models/Post');

// @type  POST
// @route /fetcher/getAllPostDetails
// @desc  for getting all posts of a user
// @access PRIVATE
router.post("/getAllPostDetails",jwtVerify,async (req,res)=>{
    let {userId}=req.body;
    if(!userId){
        E.dataMissingError(res); 
        return;
    }
    let user=await User.findById(userId)
        .populate({
            path:'posts',
            populate:{
                path:"senderId",
                select:"_id name pic"
            }
        });
    if(user){
        res.status(200).json({
            success:true,
            data:user.posts
        });
    }else{
        E.notFoundError(res);
        return;
    }
});



// @type  POST
// @route /fetcher/getAllPostComments&Likes
// @desc  for getting all comments & likes of posts of a user
// @access PRIVATE
router.post("/getAllPostComments&Likes",jwtVerify,async (req,res)=>{
    let {postId}=req.body;
    if(!postId){
        E.dataMissingError(res);
        return;
    }
    if(!postTable[postId]){
        let like=await Like.findById(postId);
        if(like){
            console.log("executed");
            postTable[postId]=like.users;
        }else{
            E.resorucePresentError(res);
            return;
        }
    }
    let comment=await Comment.findById(postId).populate({
        path:"comments._id",
        select:"name pic -_id",
    });
    if(comment){
        res.status(200).json({
            success:true,
            data:{
                likes:postTable[postId].length,
                comments:comment.comments
            }
        });
    }else{
        E.notFoundError(res);
        return;
    }
});

// @type  POST
// @route /fetcher/checkLiked
// @desc  for checking a post liked by user or not
// @access PRIVATE
router.post("/checkLiked",jwtVerify,async (req,res)=>{
    let {_id,postId}=req.body;
    let users=postTable[postId];
    if(!users){
        let like=await Like.findById(postId);
        if(like){
            console.log("executed");
            postTable[postId]=like.users;
            users=postTable[postId];
        }else{
            E.resorucePresentError(res);
            return;
        }
    }
    let check=postTable[postId].includes(_id);
    res.status(200).json({
        success:true,
        data:{
            no:users.length,
            user:check
        }
    });
});


// @type  POST
// @route /fetcher/getClientDetails
// @desc  for getting details of an user
// @access PRIVATE
router.post("/getClientDetails",jwtVerify,async (req,res)=>{
    let {userId}=req.body;
    if(!userId){
        E.dataMissingError(res);
        return;
    }
    let user=await User.findById(userId).select("-posts -saved -password -__v");
    if(user){
        res.status(200).json({
            success:true,
            data:user
        });
    }else{
        E.notFoundError(res);
        return;
    }
});

// @type  GET
// @route /fetcher/getProfilePic
// @desc  for getting profile pic of an user
// @access PUBLIC
router.get("/getProfilePic",(req,res)=>{
    let {pic}=req.query;
    if(pic==undefined || pic=='undefined') {
        E.dataMissingError(res);
        return;
    }
    console.log("here");
    if(!pic){
        E.dataMissingError(res);
        return;
    }
    try{
        let stream=fs.createReadStream(path.join(__dirname,"../storage/userpics/",pic));
        stream.pipe(res);
    }catch(e){
        E.notFoundError(res);
        return;
    }
});

// @type  GET
// @route /fetcher/getPostPic
// @desc  for getting post pic of an user
// @access PRIVATE
router.get("/getPostPic",(req,res)=>{
    let {pic,token}=req.query;
    if(!pic || !token){
        E.dataMissingError(res);
        return;
    }
    req.headers.Authorization=`Bearer ${token}`;
    jwtVerify(req,res,()=>{
        try{
            let stream=fs.createReadStream(path.join(__dirname,"../storage/pics/",pic));
            stream.pipe(res);
        }catch(e){
            E.notFoundError(res);
            return;
        }
    });
});

// @type  GET
// @route /fetcher/getPostVideo
// @desc  for getting post video of an user
// @access PRIVATE
router.get("/getPostVideo",(req,res)=>{
    let {token,name}=req.query;
    req.headers.Authorization=`Bearer ${token}`;
    jwtVerify(req,res,()=>{
        const range=req.headers.range;
        const videoPath=path.join(__dirname,"../storage/videos",name);
        try{
            const videoSize=fs.statSync(videoPath).size
    
            const chunkSize = 900000;  // 500KB
            const start=parseInt(range?range.replace("bytes=",""):300000);  
            const end=Math.min(start+chunkSize,videoSize-1);
            const contentLength=end-start+1;
    
            const headers={
                "Content-Range":`bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges":"bytes",
                "Content-Length":contentLength,
                "Content-Type":"video/*"
            }
    
            res.writeHead(206,headers);
    
            const stream=fs.createReadStream(videoPath,{start,end})
            stream.pipe(res);
        }catch(e){
            E.notFoundError(res);
            return;
        }
    });
});


// @type  POST
// @route /fetcher/getAllRecentPostsOfFollowing
// @desc  for getting all posts of following users
// @access PRIVATE

router.post("/getAllRecentPostsOfFollowing",jwtVerify,async (req,res)=>{
    let {_id} = req.body;
    let connection=await Connection.findById(_id);
    if(connection){
        Post.find({ "senderId": { "$in": [...connection.following,_id] } }).limit(100)
        .sort('-timeStamp').populate({
            path:"senderId",
            select:"_id name pic"
        }).exec().then(posts=>{
            res.status(200).json({
                success:true,
                data:posts
            });
        }).catch(err=>{
            E.serverError(res);
            console.log(err);
        });
    }else{
        E.notFoundError(res);
    }
});

// @type  GET
// @route /fetcher/getSinglePostDetails
// @desc  for getting details of a particular post
// @access PUBLIC
router.get("/getSinglePostDetails/:postId",(req,res)=>{
    let {postId}=req.params;
    if(!postId){
        E.dataMissingError(res);
        return;
    }
    Post.findById(postId).populate({
        path:"senderId",
        select:"_id name pic"
    }).then(data=>{
        res.status(200).json({
            success:true,
            data:data
        });
    }).catch(err=>{
        console.log(err);
        E.notFoundError(res);
    })
});


// @type  POST
// @route /fetcher/getPeopleBySearch
// @desc  for getting peoples by search
// @access PRIVATE
router.post("/getPeopleBySearch",jwtVerify,(req,res)=>{
    let {searchField}=req.body;
    if(!searchField){
        E.dataMissingError(res);
        return;
    }
    User.find({'name' : new RegExp(searchField, 'i')}).select("_id name pic").then(docs=>{
        res.status(200).json({
            success:true,
            data:docs
        });
    }).catch(err=>{
        E.serverError(res);
    })
});


// @type  POST
// @route /fetcher/getFollowing&Followers
// @desc  for getting peoples followings & followers
// @access PRIVATE
router.post("/getFollowing&Followers",jwtVerify,(req,res)=>{
    let {userId}=req.body;
    if(!userId){
        E.dataMissingError(res);
        return;
    }
    Connection.findById(userId).then(data=>{
        res.status(200).json({
            success:true,
            data:{
                followers:data.followers.length,
                following:data.following.length
            }
        });
    }).catch(err=>{
        E.resorucePresentError(res);
    });
});


// @type  POST
// @route /fetcher/getFollowingOfMainUser
// @desc  for main users followings
// @access PRIVATE
router.post("/getFollowingOfMainUser",jwtVerify,(req,res)=>{
    let {_id}=req.body;
    Connection.findById(_id).then(data=>{
        res.status(200).json({
            success:true,
            data:data.following
        });
    }).catch(err=>{
        E.serverError(res);
    });
});

// @type  POST
// @route /fetcher/getSavedPostsOfMainUser
// @desc  for main user's saved posts
// @access PRIVATE
router.post("/getSavedPostsOfMainUser",jwtVerify,(req,res)=>{
    let {_id}=req.body;
    User.findById(_id).populate({ 
        path: 'saved',
        populate: {
          path: 'senderId',
          select: '_id name pic'
        } 
     }).then(data=>{
        res.status(200).json({
            success:true,
            data:data.saved
        });
     }).catch(err=>{
        E.notFoundError(res);
     });
});

module.exports=router;