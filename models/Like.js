const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const LikeSchema=new Schema({
    users:[
        {
            type:mongoose.SchemaTypes.ObjectId,
            ref:"user"
        }
    ]
});

module.exports=Like=mongoose.model("like",LikeSchema);