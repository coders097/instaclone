const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const PostSchema=new Schema({
    contentType:{
        type:String,
        enum:['MESSAGE','PIC','VIDEO'],
        default:'MESSAGE'
    },
    message:{
        type:String,
        default:""
    },
    content:{ 
        type:String
    },
    timeStamp:{
        type:Date,
        default:Date.now
    },
    senderId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"user",
        required:true
    }
});

module.exports=Post=mongoose.model("post",PostSchema);