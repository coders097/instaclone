const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pic:{ 
        type:String,
        default:"avatar.jpg"
    },
    details:{
        type:String, 
        default:""
    },
    posts:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"post"
    }],
    saved:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"post"
    }]
});

module.exports=User=mongoose.model("user",UserSchema);