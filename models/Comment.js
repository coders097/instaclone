const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const CommentSchema=new Schema({
    comments:[
        {
            timeStamp:{
                type:Date,
                default:Date.now
            }, 
            message:{
                type:String
            },
            _id:{
                type:mongoose.SchemaTypes.ObjectId,
                ref:"user"
            }
        }
    ]
});

module.exports=Comment=mongoose.model("comment",CommentSchema);