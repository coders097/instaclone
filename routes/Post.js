const express=require('express');
const router=express.Router();
const jwtVerify=require('../middlewares/jwtAuthentication');
const fs=require('fs');
const path=require('path');
const E=require("../utils/errors");


// configuring multer
const multer=require("multer");
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
});

// Models
const Post=require('../models/Post');
const User=require('../models/User');
const Comment=require('../models/Comment');
const Like=require('../models/Like');

// @type  PUT
// @route /post/savePost
// @desc  for saving & unsaving a post
// @access PRIVATE
router.put("/savePost",jwtVerify,(req,res)=>{
    let {postId,_id}=req.body;
    if(!postId){
        E.dataMissingError(res);
        return;
    }
    console.log(postId);
    User.findById(_id).then(user=>{
        if(user.saved.includes(postId)){
            user.saved=user.saved.filter(id=>id.toString()!==postId);
            console.log(user.saved);
        } else {
            user.saved.push(postId);
            console.log(user.saved);
        }
        user.save().then(()=>{
            res.status(200).json({
                success:true
            });
        }).catch(err=>{
            E.serverError(res);
            console.log(err);
        })
    }).catch(err=>{
        E.notFoundError(res);
        console.log(err);
    })
    // saved
});


// @type  POST
// @route /post/addPost
// @desc  for adding a post
// @access PRIVATE
router.post("/addPost",upload.any(),(req,res)=>{
    jwtVerify(req,res,async ()=>{
        let {_id,message}=req.body;
        if(!message){
            E.dataMissingError(res);
            return;
        }
        let user=await User.findById(_id);
        if(!user){
            E.notFoundError(res);
            return;
        }
        let contentType="MESSAGE";
        let file=req.files?req.files[0]:null;
        let uploadName="";
        if(file){
            uploadName=`${_id}_${Date.now()}`;
            if(file.mimetype==='image/jpeg'){
                contentType="PIC";
                uploadName+=".jpg";
                try{
                    fs.writeFileSync(
                        path.join(__dirname, "../storage/pics", uploadName),
                        file.buffer
                      );
                }catch(e){
			    console.log(e);
                    E.serverError(res);
                    return;
                }
            }else if(file.mimetype==='video/mp4'){
                contentType="VIDEO";
                uploadName+=".mp4";
                try{
                    fs.writeFileSync(
                        path.join(__dirname, "../storage/videos", uploadName),
                        file.buffer
                      );
                }catch(e){
	            console.log(e);
                    E.serverError(res);
                    return;
                }
            }
        }
        Post.create({
            contentType:contentType,
            message:message,
            content:uploadName,
            senderId:_id
        }).then(async (post)=>{
            user.posts.push(post._id);
            user.save().then(async ()=>{
                try{
                    let like=await Like.create({
                        _id:post._id
                    });
                    let comment=await Comment.create({
                        _id:post._id
                    });      
                    res.status(200).json({
                        success:true,
                        data:post
                    });
                }catch(e){
	console.log(e);
                    E.serverError(res);
                    return;
                }
            }).catch((e)=>{
	console.log(e);
                E.serverError(res);
                return;
            });
        }).catch(err=>{
	        console.log(err);
            E.serverError(res);
        });
    });
});

// @type  DELETE
// @route /post/removePost
// @desc  for deleting a post
// @access PRIVATE
router.delete("/removePost",jwtVerify,async (req,res)=>{
    let {_id,postId}=req.body;
    let user=await User.findById(_id);
    if(!user){
        E.notFoundError(res);
        return;
    }
    let found=false;
    user.posts=user.posts.filter(id=>{
        if(id==postId) found=true;
        return id!=postId;
    });
    user.save().then(()=>{
        res.status(200).json({
            success:true
        });
        // now remove the post
        if(found){
            console.log("found");
            Post.deleteOne({
                _id:postId
            }).then(()=>{
                Comment.deleteOne({
                    _id:postId
                }).then(()=>{
                    Like.deleteOne({
                        _id:postId
                    }).then(()=>{
                        console.log("Successfully Deleted A POST!");
                    }).catch(()=>{
                        console.log("DELLIKE :: "+postId);
                    });
                }).catch(()=>{
                    console.log("DELCOMMENT :: "+postId);
                });
            }).catch(()=>{
                console.log("DELPOST :: "+postId);
            });
        }
    }).catch(err=>{
        E.serverError(res);
    }); 
});

// @type  PATCH
// @route /post/likePost
// @desc  for liking a post
// @access PRIVATE
let __postTable={}; // holds info on likes
let saveLikesDataToDB=()=>{
    let likesData=fs.readFileSync(path.join(__dirname,'../localStorage/likes_file'));
    likesData=JSON.parse(likesData);

    // Writing all like data at a time 
    Like.bulkWrite(Object.keys(likesData).map(likeId=>{
        return {
            'updateOne':{
                'filter':{'_id':likeId},
                'update':{
                    '$set':{
                        'users':likesData[likeId]
                    }
                },
                'upsert':true
            }
        };
    })).then(()=>{
        console.log("Success Saving Likes!");
    }).catch(()=>{
        console.log("SAVELIKES :: Success Saving FAILED!");
    });
}
let saveLikesInIntervalToLocalStorage=()=>{
    fs.writeFileSync(path.join(__dirname,'../localStorage/likes_file'),JSON.stringify(__postTable));
    saveLikesDataToDB();
}
router.patch("/likePost",jwtVerify,async (req,res)=>{
    let {_id,postId}=req.body;
    if(!__postTable[postId]){
        let like=await Like.findById(postId);
        if(like){
            console.log("executed");
            __postTable[postId]=like.users;
        }else{
            E.resorucePresentError(res);
            return;
        }
    }
    // now __postTable[postId] is an []
    let check=true;
    if(__postTable[postId].includes(_id)){
        __postTable[postId]=__postTable[postId].filter(id=>id!=_id);
        check=false;
    }else{
        __postTable[postId].push(_id);
    }
    res.status(200).json({
        success:true,
        data:{
            no:__postTable[postId].length,
            user:check
        }
    });
    saveLikesInIntervalToLocalStorage();
});


// @type  PATCH
// @route /post/commentPost
// @desc  for commenting on a post
// @access PRIVATE
router.patch("/commentPost",jwtVerify,async (req,res)=>{
    let {_id,postId,message}=req.body;
    if(!_id || !postId || !message){
        E.dataMissingError(res);
        return;
    }
    let comment=await Comment.findById(postId);
    if(comment){
        comment.comments.push({
            message:message,
            _id:_id
        });
        comment.save().then(_com=>{
            res.status(200).json({
                success:true
            });
        }).catch(err=>{
            E.serverError(res);
            return;
        });
    }else {
        E.resorucePresentError(res);
        return;
    }
});

// @type  POST
// @route /post/editPost
// @desc  for editing on a post
// @access PRIVATE
router.post("/editPost",upload.any(),(req,res)=>{
    jwtVerify(req,res,async ()=>{
        let {_id,postId,message,contentType}=req.body; 
        if(!postId || !contentType){
            E.dataMissingError(res);
            return;
        }
        let post=await Post.findById(postId);
        if(!post){
            E.notFoundError(res);
            return;
        }
        let user=await User.findById(_id);
        if(user.posts.includes(postId)){
            let valueToDelete=post.content;
            let valueToDeleteType=post.contentType;
            if(contentType==="MESSAGE"){
                post.contentType=contentType;
                post.message=message;
                post.content="";
            }
            else{
                post.contentType=contentType;
                if(message) post.message=message;
                let file=req.files[0];
                if(file){
                    let uploadName=`${_id}_${Date.now()}`;
                    if(file.mimetype==='image/jpeg'){
                        uploadName+=".jpg";
                        try{
                            fs.writeFileSync(
                                path.join(__dirname, "../storage/pics", uploadName),
                                file.buffer
                              );
                        }catch(e){
                            E.serverError(res);
                            return;
                        }
                    }else if(file.mimetype==='video/mp4'){
                        uploadName+=".mp4";
                        try{
                            fs.writeFileSync(
                                path.join(__dirname, "../storage/videos", uploadName),
                                file.buffer
                              );
                        }catch(e){
                            E.serverError(res);
                            return;
                        }
                    }
                    post.content=uploadName;
                }else{
                    E.dataMissingError(res);
                    return;
                }
            }
            post.save().then((_post)=>{
                res.status(200).json({
                    success:true,
                    data:_post
                });
            }).catch(()=>{
                E.serverError(res);
            });
            // delete old values
            if(valueToDeleteType!=="MESSAGE"){
                try{
                    if(valueToDeleteType==="PIC")
                        fs.unlinkSync(path.join(__dirname, "../storage/pics", valueToDelete));
                    else fs.unlinkSync(path.join(__dirname, "../storage/videos", valueToDelete));
                }catch(e){
                    console.log("DELUSERPICORVIDEO :: "+valueToDelete);
                }
            }
        }else{
            E.authenticationError(res);
            return;
        }
    });
});


module.exports={
    router,
    __postTable
};