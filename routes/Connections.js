const express=require('express');
const router=express.Router();
const jwtVerify=require('../middlewares/jwtAuthentication');
const E=require("../utils/errors");

// Models
const Connection=require('../models/Connection');

// @type  PUT
// @route /connections/followUser
// @desc  for following an user
// @access PRIVATE
router.put("/followUser",jwtVerify,async (req,res)=>{
    let {userId,_id}=req.body;
    if(!userId){
        E.dataMissingError(res);
        return;
    }
    if(userId==_id){
        E.dataMissingError(res);
        return;
    }
    let connection=await Connection.findById(_id);
    let friendConnection=await Connection.findById(userId);

    if(!connection || !friendConnection){
        E.notFoundError(res);
        return;
    }
    if(!connection.following.includes(userId)){
        if(connection && friendConnection){
            connection.following.push(userId);
            friendConnection.followers.push(_id);
            connection.save().then((_conn)=>{
                friendConnection.save().then((_friConn)=>{
                    res.status(200).json({
                        success:true
                    });
                }).catch(err=>{
                    E.serverError(res);
                    connection.following=connection.following.filter(id=>id!=userId);
                    connection.save().then(()=>{}).catch(err=>{
                        console.log("DELCONNECTION :: FOLLOWING :: ",_id," -> ",userId);
                    });
                });
            }).catch(err=>{
                E.serverError(res);
                return;
            });
        }else{
            E.notFoundError(res);
        }
    }else{
        E.resorucePresentError(res);
        return;
    }
});

// @type  PUT
// @route /connections/unfollowUser
// @desc  for unfollowing an user
// @access PRIVATE
router.put("/unfollowUser",jwtVerify,async (req,res)=>{
    let {userId,_id}=req.body;
    if(!userId){
        E.dataMissingError(res);
        return;
    }
    if(userId==_id){
        E.dataMissingError(res); 
        return;
    }
    let connection=await Connection.findById(_id);
    let friendConnection=await Connection.findById(userId);
    if(!connection || !friendConnection){
        E.notFoundError(res);
        return;
    }

    if(connection.following.includes(userId)){
        connection.following=connection.following.filter(id=>id!=userId);
        friendConnection.followers=friendConnection.followers.filter(id=>id!=_id);
        connection.save().then((_conn)=>{
            friendConnection.save().then((_friConn)=>{
                res.status(200).json({
                    success:true
                });
            }).catch(err=>{
                E.serverError(res);
                connection.following=connection.following.push(userId);
                connection.save().then(()=>{}).catch(err=>{
                    console.log("MAKECONNECTION :: FOLLOWING :: ",_id," -> ",userId);
                });
            });
        }).catch(err=>{
            E.serverError(res);
            return;
        });
    }else{
        E.notFoundError(res);
    }
});


module.exports=router;