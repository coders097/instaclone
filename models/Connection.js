const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const ConnectionSchema=new Schema({
    followers:[
        {
            type:mongoose.SchemaTypes.ObjectId,
            ref:"user"
        }
    ],
    following:[
        {
            type:mongoose.SchemaTypes.ObjectId,
            ref:"user"
        } 
    ]
});

module.exports=Connection=mongoose.model("connection",ConnectionSchema);