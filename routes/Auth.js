const express=require('express');
const router=express.Router();
const jwtVerify=require('../middlewares/jwtAuthentication');
const fs=require('fs');
const path=require('path');
const E=require("../utils/errors");


const bcrypt=require('bcryptjs');
const jwt=require("jsonwebtoken");
const saltRounds = 14;
const jwt_key=process.env.JWT_KEY;


// configuring multer
const multer=require("multer");
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
});


// Models Import
const User=require('../models/User');
const Connection=require('../models/Connection');


// @type  POST
// @route /auth/signin
// @desc  for logging in
// @access PUBLIC
router.post("/signin",async (req,res)=>{
    const { password, email } = req.body;
    if (!email || !password) {
      E.dataMissingError(res);
      return;
    }
    let userMatch = await User.findOne({ email: email });
    if (userMatch) {
        let submittedPass = password;
        let savedPass = userMatch.password;
        const comparePassword = bcrypt.compareSync(submittedPass, savedPass);
        if (comparePassword === true) {
            let timeInMinutes = 120;
            let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
            let token = jwt.sign(
                {
                    name: userMatch.name,
                    _id: userMatch._id,
                    exp: expires,
                },
                jwt_key
            );
            res.status(200).send({
                success: true,
                data: {
                    _id: userMatch._id,
                    name: userMatch.name,
                    email: userMatch.email,
                    pic: userMatch.pic,
                    details:userMatch.details,
                    token: token,
                }
            });
        } else {
            E.authenticationError(res);
        }
    } else {
        E.notFoundError(res);
    }
});

// @type  POST
// @route /auth/signup
// @desc  for creating an account
// @access PUBLIC
router.post("/signup",upload.any(),async (req,res)=>{
    const { name, email, password, details } = req.body;
    if (!email || !password || !name) {
      E.dataMissingError(res);
      return;
    }
    let userMatch = await User.findOne({ email: email });
    if (userMatch) {
      E.resorucePresentError(res);
    } else {
      const temp_password = bcrypt.hashSync(password, saltRounds);
      let pic_name = `${name}_${Date.now()}.jpg`;
      let pic_present = false;
      if (req.files[0]) {
        // await cloudStorage.file(pic_name).createWriteStream().end(req.files[0].buffer);
        fs.writeFileSync(
          path.join(__dirname, "../storage/userpics", pic_name),
          req.files[0].buffer
        );
        pic_present = true;
      } else pic_name = "avatar.jpg";
  
      const new_user = new User({
        name: name,
        email: email,
        password: temp_password,
        pic: pic_name,
        details:(details?details:"")
      });
      new_user.save(async (err, user) => {
        if (err) {
          console.log("SERVERPROB :: Failed to Save :: "+new Date());
          if (pic_present) {
            try {
              fs.unlinkSync(path.join(__dirname, "../storage/userpics", pic_name));
            //   await cloudStorage.file(pic_name).delete();
            } catch (e) {
                console.log("DELUSERPIC :: "+pic_name);
            }
          }
          E.serverError(res);
        } else {
          Connection.create({
            _id:user._id
          }).then(()=>{
            res.status(200).json({
              success: true,
            });
          }).catch(err=>{
            E.serverError(res);
            User.deleteOne({_id:user._id}).then(()=>{}).catch(err=>{
              console.log("DELUSER :: "+user._id);
            });
          });
        }
      });
    }
});

// @type  PATCH
// @route /auth/editUser
// @desc  for editing account of user
// @access PRIVATE
router.patch("/editUser",upload.any(),(req,res)=>{
    jwtVerify(req,res,()=>{
      let { _id, name, email, password ,details} = req.body;
      User.findById(_id)
        .then(async (user) => {
          let oldPic = user.pic;
          let newPic = oldPic;
          if (req.files && req.files[0]) {
            newPic = `${user.name}_${Date.now()}.jpg`;
          //   await cloudStorage.file(newPic).createWriteStream().end(req.files[0].buffer);
            fs.writeFileSync(
              path.join(__dirname, "../storage/userpics", newPic),
              req.files[0].buffer
            );
            user.pic = newPic;
          }
          if (name) user.name = name;
          if (email) user.email = email;
          if (password) {
            const temp_password = bcrypt.hashSync(password, saltRounds);
            user.password = temp_password;
          }
          if(details) user.details = details;
          user
            .save()
            .then(async () => {
              res.status(200).json({
                success: true,
                data: {
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  pic: user.pic,
                  details:user.details
                }
              });
              if (oldPic !== newPic) {
                if (oldPic !== "avatar.jpg") {
                  try {
                    fs.unlinkSync(path.join(__dirname, "../storage/userpics", oldPic));
                  //   await cloudStorage.file(oldPic).delete();
                  } catch (E) {
                      console.log("SERVERPROB :: Failed to delete :: "+new Date()+" : "+oldPic);
                  }
                }
              }
            })
            .catch(() => {
              E.serverError(res);
            });
        })
        .catch((err) => {
          console.log(err);
          E.resorucePresentError(res);
        });
    });
});

// @type  DELETE
// @route /auth/removeUser
// @desc  for removing account of user
// @access PRIVATE
router.delete("/removeUser",jwtVerify,async (req,res)=>{
    let {email,password,_id}=req.body;
    if(!email || !password || !_id){
        E.dataMissingError(res);
        return;
    }
    let userMatch = await User.findOne({ _id });
    if(userMatch && (userMatch.email===email) && bcrypt.compareSync(password,userMatch.password)){
        userMatch.delete().then(()=>{
            res.status(200).json({
                success:true
            });
            try{
              if(userMatch.pic!=="avatar.jpg")
                fs.unlinkSync(path.join(__dirname, "../storage/userpics", userMatch.pic));
            }catch(err){

            }
        }).catch(err=>{
            console.log("SERVERPROB :: Failed to Delete :: "+new Date());
            E.serverError(res);
        });
    }else{
        E.authenticationError(res);
    }
});


// @type  POST
// @route /auth/checkValidity
// @desc  for checking validity of user
// @access PRIVATE
router.post("/checkValidity",jwtVerify,(req,res)=>{
  res.status(200).json({
    success:true
  });
});


// @type  PUT
// @route /auth/editUser
// @desc  for updating profile info
// @access PRIVATE
router.put("/editUser",jwtVerify,(req,res)=>{
  let {_id,name,email,password,details,oldPassword}=req.body;
  User.findById(_id).then(user=>{
    let submittedPass = oldPassword;
    let savedPass = user.password;
    const comparePassword = bcrypt.compareSync(submittedPass, savedPass);
    if (comparePassword === true) {
        if(name) user.name=name;
        if(email) user.email=email;
        if(password) {
            const new_password = bcrypt.hashSync(password, saltRounds);
            user.password=new_password;
        }
        if(details) user.details=details;
        user.save().then(()=>{
          res.status(200).json({
            success:true
          });
        }).catch(err=>{
          E.serverError(res);
        });     
    } else {
      E.authenticationError(res);
      return;
    }
  }).catch(err=>{
    E.notFoundError(res);
  });
});


// @type  POST
// @route /auth/changeProfilePic
// @desc  for changing profile pic of user
// @access PRIVATE
router.post("/changeProfilePic",upload.any(),async (req,res)=>{
  let {Authorization}=req.body;
  if(!Authorization){
    E.notFoundError(res);
    return;
  }
  req.headers.Authorization=`Bearer ${Authorization}`;
  jwtVerify(req,res,async ()=>{
    let {_id} = req.body;
    let file=req.files[0];
    try{
      let user=await User.findById(_id);
      if(!user){
        E.notFoundError(res);
        return;
      }
      let old_pic=user.pic;
      if(!file){
        if(old_pic==="avatar.jpg"){
          res.status(200).json({
            success:true,
            data:old_pic
          });
        }else{
          user.pic="avatar.jpg";
          user.save().then(()=>{
            res.status(200).json({
              success:true,
              data:"avatar.jpg"
            });
            try{
              fs.unlinkSync(path.join(__dirname, "../storage/userpics",old_pic));
            }catch(e){
              console.log("DELUSERPIC :: "+old_pic);
            }
          }).catch(err=>{
            E.serverError(res);
          });
        }
        return;
      }
      let pic_name = `${user.name}_${Date.now()}.jpg`;
      fs.writeFileSync(
        path.join(__dirname, "../storage/userpics", pic_name),
        file.buffer
      );
      user.pic=pic_name;
      user.save().then(()=>{
        res.status(200).json({
          success:true,
          data:pic_name
        });
        try{
          if(old_pic!=="avatar.jpg") fs.unlinkSync(path.join(__dirname, "../storage/userpics",old_pic));
        }catch(e){
          console.log("DELUSERPIC :: "+old_pic);
        }
      }).catch(err=>{
        console.log(err);
        E.serverError(res);
      });
    }catch(e){
      console.log(e);
      E.serverError(res);
    }
  });
});

module.exports=router;